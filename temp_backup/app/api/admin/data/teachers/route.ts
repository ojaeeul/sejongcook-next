export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'public', 'data', 'teachers.json');

export async function GET() {
    try {
        try {
            await fs.access(filePath);
        } catch {
            return NextResponse.json([]);
        }

        const fileContent = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading teachers data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Ensure directory exists
        const dirPath = path.dirname(filePath);
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }

        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        return NextResponse.json({ success: true, message: 'Teachers updated successfully' });
    } catch (error) {
        console.error('Error saving teachers data:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
