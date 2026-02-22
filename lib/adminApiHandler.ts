import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Mapping for clean URLs to file names
const BOARD_MAP: Record<string, string> = {
    'notice': 'notice_data.json',
    'qna': 'qna_data.json',
    'job-openings': 'job_openings_data.json',
    'job-seekers': 'job_seekers_data.json',
    'honor': 'honor_data.json',
    'review': 'review_data.json',
    'gallery': 'gallery_data.json',
    'inquiries': 'inquiries_data.json',
    'popups': 'popups.json',
};

export async function getFilePath(board: string) {
    const fileName = BOARD_MAP[board];
    if (!fileName) return null;
    return path.join(process.cwd(), 'public', 'data', fileName);
}

export async function handleReplace(request: NextRequest, board: string) {
    const body = await request.json();
    const filePath = await getFilePath(board);

    if (!filePath) return NextResponse.json({ error: 'Board not found' }, { status: 404 });

    try {
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Invalid data format. Expected array.' }, { status: 400 });
        }

        fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Replace error:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}

export async function handleGet(request: NextRequest, board: string) {
    // Check if we are in search-style request or direct API request
    const isClient = typeof window !== 'undefined';

    // In production (static export), we use the PHP bridge
    if (process.env.NODE_ENV === 'production' && isClient) {
        try {
            const res = await fetch(`/api.php?board=${board}`);
            if (!res.ok) throw new Error('Network response was not ok');
            return await res.json();
        } catch (error) {
            console.error('PHP Bridge Error:', error);
            return [];
        }
    }

    const filePath = await getFilePath(board);

    if (!filePath || !fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Read error:', error);
        return NextResponse.json({
            error: 'Failed to read data',
            details: (error as Error).message
        }, { status: 500 });
    }
}

export async function handlePost(request: NextRequest, board: string) {
    const isClient = typeof window !== 'undefined';
    if (process.env.NODE_ENV === 'production' && isClient) {
        try {
            const body = await request.json();
            const res = await fetch(`/api.php?board=${board}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            return await res.json();
        } catch (error) {
            console.error('PHP Bridge POST Error:', error);
            return { error: 'Failed to save via PHP bridge' };
        }
    }
    const body = await request.json();
    const filePath = await getFilePath(board);

    if (!filePath) {
        return NextResponse.json({ error: 'Board not found' }, { status: 404 });
    }

    try {
        // Special handling for full array replacement (e.g. from client-side append logic)
        if (Array.isArray(body)) {
            fs.writeFileSync(filePath, JSON.stringify(body, null, 2), 'utf-8');
            return NextResponse.json({ success: true, count: body.length });
        }

        let existingData = [];
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            existingData = JSON.parse(fileContent);
        }

        const newId = existingData.length > 0
            ? String(Math.max(...existingData.map((item: { id: string | number }) => Number(item.id) || 0)) + 1)
            : "1";

        const newItem = {
            id: newId,
            ...body,
            date: body.date || new Date().toISOString().split('T')[0],
            hit: 0,
        };

        const newData = [...existingData, newItem];
        fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf-8');

        return NextResponse.json({ success: true, item: newItem });
    } catch (error) {
        console.error('Write error:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}

export async function handlePut(request: NextRequest, board: string) {
    const isClient = typeof window !== 'undefined';
    if (process.env.NODE_ENV === 'production' && isClient) {
        try {
            const body = await request.json();
            const res = await fetch(`/api.php?board=${board}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            return await res.json();
        } catch (error) {
            console.error('PHP Bridge PUT Error:', error);
            return { error: 'Failed to update via PHP bridge' };
        }
    }
    const body = await request.json();
    const filePath = await getFilePath(board);

    if (!filePath) return NextResponse.json({ error: 'Board not found' }, { status: 404 });

    try {
        if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Data not found' }, { status: 404 });

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const existingData = JSON.parse(fileContent);

        const index = existingData.findIndex((item: { id: string | number }) => String(item.id) === String(body.id));
        if (index === -1) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        existingData[index] = { ...existingData[index], ...body };

        fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf-8');

        return NextResponse.json({ success: true, item: existingData[index] });
    } catch (error) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
    }
}

export async function handleDelete(request: NextRequest, board: string) {
    const isClient = typeof window !== 'undefined';
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (process.env.NODE_ENV === 'production' && isClient) {
        try {
            const res = await fetch(`/api.php?board=${board}&id=${id}`, {
                method: 'DELETE'
            });
            return await res.json();
        } catch (error) {
            console.error('PHP Bridge DELETE Error:', error);
            return { error: 'Failed to delete via PHP bridge' };
        }
    }
    const filePath = await getFilePath(board);

    if (!filePath || !id) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    try {
        if (!fs.existsSync(filePath)) return NextResponse.json({ error: 'Data not found' }, { status: 404 });

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const existingData = JSON.parse(fileContent);

        const newData = existingData.filter((item: { id: string | number }) => String(item.id) !== String(id));

        fs.writeFileSync(filePath, JSON.stringify(newData, null, 2), 'utf-8');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
    }
}
