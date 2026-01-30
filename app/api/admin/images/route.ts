
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'gallery_data.json');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Helper: Ensure Data File Exists & Migrate if needed
async function getGalleryData() {
    try {
        await fs.access(DATA_FILE);
        const content = await fs.readFile(DATA_FILE, 'utf-8');
        return JSON.parse(content);
    } catch {
        // File doesn't exist, migrate from existing folders
        console.log('Migrating gallery data from files...');
        const directories = ['uploads', 'img_up', 'img/cards'];
        let allImages: any[] = [];
        let idCounter = 1;

        async function scan(dirPath: string, relativePath: string) {
            try {
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                for (const entry of entries) {
                    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(entry.name)) {
                        // Sort of stable ID based on name hash or just counter for migration
                        const relPath = path.join(relativePath, entry.name);
                        allImages.push({
                            id: String(Date.now() + idCounter++),
                            name: entry.name,
                            url: `/${relPath}`,
                            path: relPath // Keep relative path for deletion usually
                        });
                    }
                }
            } catch (e) { }
        }

        for (const dir of directories) {
            // We need to check if dir exists first inside scan or before
            const fullPath = path.join(PUBLIC_DIR, dir);
            await scan(fullPath, dir);
        }

        // Save migrated data (Newest first effectively if we just reverse or sort?)
        // Let's just save as is. 
        await fs.writeFile(DATA_FILE, JSON.stringify(allImages, null, 2));
        return allImages;
    }
}

export async function GET() {
    try {
        const data = await getGalleryData();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        // Body should be the new image object { url, name, ... }
        const currentData = await getGalleryData();

        const newItem = {
            id: String(Date.now()),
            name: body.name,
            url: body.url,
            // Extract relative path from URL if not provided, assuming /xyz format
            path: body.url.startsWith('/') ? body.url.substring(1) : body.url
        };

        // Add to beginning
        const newData = [newItem, ...currentData];
        await fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2));

        return NextResponse.json(newData);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to add image' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        // Body is the new sorted Array
        if (!Array.isArray(body)) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

        await fs.writeFile(DATA_FILE, JSON.stringify(body, null, 2));
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const currentData = await getGalleryData();
        const targetIndex = currentData.findIndex((img: any) => img.id === id);

        if (targetIndex === -1) {
            return NextResponse.json({ error: 'Image not found' }, { status: 404 });
        }

        const targetImage = currentData[targetIndex];

        // Remove from list
        const newData = currentData.filter((img: any) => img.id !== id);
        await fs.writeFile(DATA_FILE, JSON.stringify(newData, null, 2));

        // Delete actual file
        try {
            const filePath = path.join(PUBLIC_DIR, targetImage.path);
            await fs.unlink(filePath);
        } catch (e) {
            console.error('Failed to delet file from disk (might be missing)', e);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
