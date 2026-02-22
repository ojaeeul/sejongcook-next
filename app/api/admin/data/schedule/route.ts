import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'schedule_data.json');

export async function GET() {
    try {
        const fileContent = await fs.readFile(DATA_FILE_PATH, 'utf-8');
        const data = JSON.parse(fileContent);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to read schedule data:', error);
        // Fallback: try to see if file exists, if not create default
        return NextResponse.json({ content: '' }, { status: 200 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to save schedule data:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
