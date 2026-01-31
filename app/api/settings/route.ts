import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'settings.json');

const DEFAULT_SETTINGS = {
    showAuthLinks: true
};

export async function GET() {
    try {
        const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
        const data = JSON.parse(fileContent);
        return NextResponse.json(data);
    } catch (error) {
        // If file doesn't exist, return default data
        return NextResponse.json(DEFAULT_SETTINGS);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save settings:', error);
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
