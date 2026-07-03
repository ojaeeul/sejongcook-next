import { NextResponse } from 'next/server';

export const maxDuration = 60; // Vercel 서버 타임아웃을 최대 60초로 연장

let nextKeyIndex = 0;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        const envKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
        if (!envKeys) {
            return NextResponse.json({ error: 'API Key not configured on the server. Please contact administrator.' }, { status: 500 });
        }

        const keys = envKeys.split(',').map(k => k.trim()).filter(k => k);
        let validKeys = [...keys];
        let response;
        let lastErrorText = '';
        let lastStatus = 500;

        for (let i = 0; i < 20; i++) {
            if (validKeys.length === 0) {
                lastErrorText = lastErrorText || "모든 API 키가 한도를 초과했거나 유효하지 않습니다.";
                // 429로 덮어쓰지 않고 원래 에러 코드를 유지합니다.
                break;
            }

            const keyIndex = (nextKeyIndex++) % validKeys.length;
            const apiKey = validKeys[keyIndex];
            const targetModel = body.model || 'gemini-2.5-flash';
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
            
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                break;
            }

            lastStatus = response.status;
            lastErrorText = await response.text();
            console.log(`Gemini API returned ${lastStatus}: ${lastErrorText.substring(0, 100)}... Retrying...`);
            
            if (lastStatus === 429) {
                // Rate limit: remove this key from current request, try others
                validKeys = validKeys.filter(k => k !== apiKey);
                await new Promise(res => setTimeout(res, 1500)); 
            }
            else if (lastStatus === 401 || lastStatus === 403) {
                // Invalid or disabled key
                validKeys = validKeys.filter(k => k !== apiKey);
            }
            else if (lastStatus === 400) {
                // Bad request (e.g. safety filter, invalid payload). Retrying won't help.
                break;
            }
            else {
                // Server errors (500, 503). Wait and retry with the same key.
                await new Promise(res => setTimeout(res, 2000));
            }
        }

        if (!response || !response.ok) {
            console.error('Gemini API Error:', lastStatus, lastErrorText);
            return NextResponse.json({ error: `Google API Error: ${lastStatus}`, details: lastErrorText }, { status: lastStatus });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Server error during AI analysis:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
