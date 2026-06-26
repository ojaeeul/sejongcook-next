import { NextResponse } from 'next/server';

export const maxDuration = 60; // Vercel 서버 타임아웃을 최대 60초로 연장

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Parse multiple API keys if available
        const envKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
        
        if (!envKeys) {
            return NextResponse.json({ error: 'API Key not configured on the server. Please contact administrator.' }, { status: 500 });
        }

        const keys = envKeys.split(',').map(k => k.trim()).filter(k => k);
        // Use gemini-1.5-flash-latest for 3x faster speed and no hallucination
        
        let response;
        let retries = Math.max(5, keys.length * 2);
        let lastErrorText = '';
        let lastStatus = 500;

        for (let i = 0; i <= retries; i++) {
            const apiKey = keys[Math.floor(Math.random() * keys.length)];
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            
            response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                break;
            }

            lastStatus = response.status;
            lastErrorText = await response.text();
            console.log(`Gemini API returned ${lastStatus}: ${lastErrorText}. Retrying... (${retries - i} left)`);
            
            if (i < retries) {
                // 키가 여러 개면 바로 교체해서 찔러보도록 딜레이 대폭 축소 (1000ms -> 300ms)
                await new Promise(res => setTimeout(res, 300));
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
