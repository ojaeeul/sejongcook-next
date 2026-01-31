import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const dataFilePath = path.join(process.cwd(), 'public', 'data', 'baking_posts.json');

export async function GET() {
    try {
        const fileContent = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContent);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to read baking data", error);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        // Read existing data
        let posts = [];
        try {
            const fileContent = await fs.readFile(dataFilePath, 'utf8');
            posts = JSON.parse(fileContent);
        } catch (e) {
            // If file doesn't exist or is empty, start fresh
            posts = [];
        }

        const body = await request.json();

        // Ensure ID
        const newPost = {
            id: body.id || Date.now().toString(),
            category: body.category || '갤러리',
            title: body.title,
            author: body.author || '관리자',
            date: body.date || new Date().toISOString().split('T')[0],
            hit: body.hit || "0",
            content: body.content || ""
        };

        if (body.id) {
            // Update existing
            const index = posts.findIndex((p: any) => p.id === body.id);
            if (index !== -1) {
                posts[index] = { ...posts[index], ...newPost };
            } else {
                posts.unshift(newPost);
            }
        } else {
            // Create new (add to top)
            posts.unshift(newPost);
        }

        // Write back
        await fs.writeFile(dataFilePath, JSON.stringify(posts, null, 4), 'utf8');

        return NextResponse.json({ success: true, post: newPost });
    } catch (error) {
        console.error("Failed to save baking post", error);
        return NextResponse.json({ success: false, error: "Failed to save data" }, { status: 500 });
    }
}
