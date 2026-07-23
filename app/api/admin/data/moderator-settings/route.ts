import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'public', 'data', 'moderator_settings.json');

export async function GET() {
    try {
        if (!fs.existsSync(dataFilePath)) {
            return NextResponse.json({ enabled: true, systemPrompt: '' });
        }
        const fileContents = fs.readFileSync(dataFilePath, 'utf8');
        const settings = JSON.parse(fileContents);
        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to read settings', details: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        fs.writeFileSync(dataFilePath, JSON.stringify(body, null, 2), 'utf8');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to save settings', details: error.message }, { status: 500 });
    }
}
