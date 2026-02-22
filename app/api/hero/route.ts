export const dynamic = "force-static";
import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { DEFAULT_HERO_DATA } from '../../data/defaultHeroData';

const DATA_FILE_PATH = path.join(process.cwd(), 'app', 'data', 'hero_data.json');

export async function GET() {
    try {
        const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
        const data = JSON.parse(fileContent);
        return NextResponse.json(data);
    } catch {
        // If file doesn't exist, return default data
        return NextResponse.json(DEFAULT_HERO_DATA);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ success: true });
    } catch (_error) {
        console.error('Failed to save hero data:', _error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
