
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'popups.json');

// Ensure data directory exists
const ensureDataDir = async () => {
    const dir = path.dirname(dataFilePath);
    try {
        await fs.access(dir);
    } catch {
        await fs.mkdir(dir, { recursive: true });
    }
};

export async function GET() {
    try {
        await ensureDataDir();
        try {
            const fileContent = await fs.readFile(dataFilePath, 'utf-8');
            const data = JSON.parse(fileContent);
            return NextResponse.json(data);
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                // Return empty array if file doesn't exist
                return NextResponse.json([]);
            }
            throw error;
        }
    } catch (error) {
        console.error('Failed to read popups:', error);
        return NextResponse.json({ error: 'Failed to fetch popups' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await ensureDataDir();
        await fs.writeFile(dataFilePath, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ success: true, message: 'Popups saved' });
    } catch (error) {
        console.error('Failed to save popups:', error);
        return NextResponse.json({ error: 'Failed to save popups' }, { status: 500 });
    }
}
