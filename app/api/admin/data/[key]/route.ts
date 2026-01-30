import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { revalidatePath } from 'next/cache';

// Helper to get file path
const getDataFilePath = (key: string) => {
    return path.join(process.cwd(), 'data', `${key}_data.json`);
};

export async function GET(
    request: Request,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const key = (await params).key;
        const filePath = getDataFilePath(key);

        try {
            const fileContent = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(fileContent);
            return NextResponse.json(data);
        } catch (error) {
            // If file doesn't exist, return empty array? or error?
            // For now, consistent with existing app data
            return NextResponse.json([]);
        }
    } catch (error: any) {
        return NextResponse.json({ error: `Failed to fetch data: ${error.message}` }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const key = (await params).key;
        console.log(`[AdminAPI] POST request for key: ${key}`);
        const body = await request.json();
        console.log(`[AdminAPI] Body size: ${JSON.stringify(body).length}`);
        const filePath = getDataFilePath(key);
        console.log(`[AdminAPI] Writing to file: ${filePath}`);

        // Read existing data implies full rewrite from client, so we just write body to file.
        // But body IS the new array.

        await fs.writeFile(filePath, JSON.stringify(body, null, 2), 'utf-8');

        // Revalidate paths for ISR
        revalidatePath('/'); // Homepage
        if (key === 'qna') revalidatePath('/community/qna');
        if (key === 'notice') revalidatePath('/community/notice');
        if (key === 'review') revalidatePath('/community/review'); // if exists
        // Add more specific paths if needed

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[AdminAPI] Error saving data:', error);
        return NextResponse.json({ error: `Failed to save data: ${error.message}` }, { status: 500 });
    }
}
