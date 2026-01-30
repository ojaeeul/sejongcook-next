
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { DEFAULT_HERO_DATA } from '../../data/defaultHeroData';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'hero_data.json');

export async function GET() {
    try {
        try {
            await fs.access(DATA_FILE_PATH);
        } catch {
            return NextResponse.json(DEFAULT_HERO_DATA);
        }

        const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
        const data = JSON.parse(fileContent);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to read hero data:', error);
        return NextResponse.json(DEFAULT_HERO_DATA);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Ensure directory exists
        const dir = path.dirname(DATA_FILE_PATH);
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }

        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save hero data:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
