
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Make sure uploads directory exists
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '_'); // sanitize
        const uniqueName = `${timestamp}_${originalName}`;
        const filePath = path.join(uploadDir, uniqueName);

        await fs.writeFile(filePath, buffer);

        const publicUrl = `/uploads/${uniqueName}`;

        return NextResponse.json({
            url: publicUrl,
            name: uniqueName
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
