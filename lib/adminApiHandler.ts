import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

function getFilePath(board: string) {
    let filename = `${board.replace(/-/g, '_')}_data.json`;
    if (board === 'settings') filename = 'settings.json';
    return path.join(process.cwd(), 'public', 'data', filename);
}

async function readData(board: string) {
    try {
        const fileContent = await fs.readFile(getFilePath(board), 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        return [];
    }
}

async function writeData(board: string, data: any) {
    const filePath = getFilePath(board);
    const dirPath = path.dirname(filePath);
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
    }
    await fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf8');
}

export async function handleReplace(request: NextRequest, board: string) {
    try {
        const body = await request.json();
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Invalid data format. Expected array.' }, { status: 400 });
        }
        await writeData(board, body);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to save data', details: error.message }, { status: 500 });
    }
}

export async function handleGet(request: NextRequest, board: string) {
    try {
        const data = await readData(board);
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to read data', details: error.message }, { status: 500 });
    }
}

export async function handlePost(request: NextRequest, board: string) {
    try {
        const body = await request.json();
        if (Array.isArray(body)) {
            return await handleReplace(request, board);
        }

        const data = await readData(board);
        
        if (body.id) {
            const index = data.findIndex((p: any) => String(p.id) === String(body.id));
            if (index !== -1) {
                data[index] = { ...data[index], ...body };
                await writeData(board, data);
                return NextResponse.json({ success: true, item: data[index] });
            }
        }

        const newId = data.length > 0
            ? String(Math.max(...data.map((item: any) => Number(item.id) || 0)) + 1)
            : "1";

        const newItem = {
            id: newId,
            ...body,
            date: body.date || new Date().toISOString().split('T')[0],
            hit: body.hit || "0"
        };

        data.unshift(newItem);
        await writeData(board, data);
        return NextResponse.json({ success: true, item: newItem });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to save data', details: error.message }, { status: 500 });
    }
}

export async function handlePut(request: NextRequest, board: string) {
    try {
        const body = await request.json();
        if (!body.id) return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });

        const data = await readData(board);
        const index = data.findIndex((item: any) => String(item.id) === String(body.id));
        
        if (index === -1) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        data[index] = { ...data[index], ...body };
        await writeData(board, data);

        return NextResponse.json({ success: true, item: data[index] });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to update data', details: error.message }, { status: 500 });
    }
}

export async function handleDelete(request: NextRequest, board: string) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Invalid request: missing id' }, { status: 400 });

        let data = await readData(board);
        data = data.filter((item: any) => String(item.id) !== String(id));

        await writeData(board, data);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to delete data', details: error.message }, { status: 500 });
    }
}
