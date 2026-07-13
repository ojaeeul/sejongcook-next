export const dynamic = "force-static";
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'public', 'data', 'teachers.json');

        // Check if file exists
        try {
            await fs.access(filePath);
        } catch {
            // If not found, return empty array
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
