import { NextRequest, NextResponse } from 'next/server';
import { readJson, writeJson } from '@/lib/sejongDataHandler';

const SETTINGS_FILE = 'settings.json';

export async function GET(req: NextRequest) {
    let settings = readJson<any>(SETTINGS_FILE);
    if (!settings || (Array.isArray(settings) && settings.length === 0)) {
        settings = { courseFees: {} };
    }
    return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        writeJson(SETTINGS_FILE, data);
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
