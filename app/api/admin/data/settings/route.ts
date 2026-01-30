
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'settings.json');

interface GlobalSettings {
    showAuthLinks: boolean;
}

const defaultSettings: GlobalSettings = {
    showAuthLinks: true
};

export async function GET() {
    try {
        try {
            await fs.access(DATA_FILE);
        } catch {
            await fs.writeFile(DATA_FILE, JSON.stringify(defaultSettings, null, 2), 'utf-8');
            return NextResponse.json(defaultSettings);
        }

        const content = await fs.readFile(DATA_FILE, 'utf-8');
        const data = JSON.parse(content);
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Merge with existing settings to prevent data loss if we add more settings later
        let currentSettings = defaultSettings;
        try {
            const content = await fs.readFile(DATA_FILE, 'utf-8');
            currentSettings = JSON.parse(content);
        } catch { }

        const newSettings = { ...currentSettings, ...body };

        await fs.writeFile(DATA_FILE, JSON.stringify(newSettings, null, 2), 'utf-8');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }
}
