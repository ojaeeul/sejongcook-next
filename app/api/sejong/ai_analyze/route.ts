import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Parse multiple API keys if available
        const envKeys = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
        
        if (!envKeys) {
            return NextResponse.json({ error: 'API Key not configured on the server. Please contact administrator.' }, { status: 500 });
        }

        const keys = envKeys.split(',').map(k => k.trim()).filter(k => k);
        const apiKey = keys[Math.floor(Math.random() * keys.length)];

        // Use gemini-2.5-flash for speed and accuracy
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        let response;
        let retries = 1;
        let delay = 1000;
        while (retries >= 0) {
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

            if (response.status === 503 || response.status === 429) {
                console.log(`Gemini API returned ${response.status}. Retrying... (${retries} left)`);
                if (retries > 0) {
                    await new Promise(res => setTimeout(res, delay));
                }
                retries--;
                continue;
            }
            break;
        }

        if (!response || !response.ok) {
            const errorText = await (response ? response.text() : 'Unknown error');
            const status = response ? response.status : 500;
            console.error('Gemini API Error:', status, errorText);
            return NextResponse.json({ error: `Google API Error: ${status}`, details: errorText }, { status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Server error during AI analysis:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
