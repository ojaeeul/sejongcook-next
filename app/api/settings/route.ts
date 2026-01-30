
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SETTINGS_FILE_PATH = path.join(process.cwd(), 'data', 'settings.json');

const DEFAULT_SETTINGS = {
    showAuthLinks: true
};

export async function GET() {
    try {
        try {
            await fs.access(SETTINGS_FILE_PATH);
        } catch {
            return NextResponse.json(DEFAULT_SETTINGS);
        }

        const fileContent = await fs.readFile(SETTINGS_FILE_PATH, 'utf-8');
        const data = JSON.parse(fileContent);
        return NextResponse.json({ ...DEFAULT_SETTINGS, ...data });
    } catch (error) {
        return NextResponse.json(DEFAULT_SETTINGS);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Ensure directory exists
        const dir = path.dirname(SETTINGS_FILE_PATH);
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }

        await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
