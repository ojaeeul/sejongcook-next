export const dynamic = "force-static";

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No files received.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Use a simple timestamp + sanitization for filename
        const filename = Date.now() + '_' + file.name.replace(/\s/g, '_');

        // Ensure directory exists
        const uploadDir = path.join(process.cwd(), 'public/img_up/tmp');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        return NextResponse.json({
            success: true,
            url: `/img_up/tmp/${filename}`
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
