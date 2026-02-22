import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const dataFilePath = path.join(process.cwd(), 'public', 'data', 'cooking_posts.json');

export async function GET() {
    try {
        const fileContent = await fs.readFile(dataFilePath, 'utf8');
        const data = JSON.parse(fileContent);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to read cooking data", error);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        let posts = [];
        try {
            const fileContent = await fs.readFile(dataFilePath, 'utf8');
            posts = JSON.parse(fileContent);
        } catch {
            posts = [];
        }

        const body = await request.json();
        const newPost = {
            id: body.id || Date.now().toString(),
            category: body.category || 'overview',
            title: body.title,
            author: body.author || '관리자',
            date: body.date || new Date().toISOString().split('T')[0],
            hit: body.hit || "0",
            content: body.content || ""
        };

        if (body.id) {
            const index = posts.findIndex((p: { id: string | number }) => String(p.id) === String(body.id));
            if (index !== -1) {
                posts[index] = { ...posts[index], ...newPost };
            } else {
                posts.unshift(newPost);
            }
        } else {
            posts.unshift(newPost);
        }

        await fs.writeFile(dataFilePath, JSON.stringify(posts, null, 4), 'utf8');
        return NextResponse.json({ success: true, post: newPost });
    } catch (error) {
        console.error("Failed to save cooking post", error);
        return NextResponse.json({ success: false, error: "Failed to save data" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

        const fileContent = await fs.readFile(dataFilePath, 'utf8');
        let posts = JSON.parse(fileContent);
        posts = posts.filter((p: { id: string | number }) => String(p.id) !== String(id));

        await fs.writeFile(dataFilePath, JSON.stringify(posts, null, 4), 'utf8');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete cooking post", error);
        return NextResponse.json({ success: false, error: "Failed to delete data" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    return POST(request);
}
