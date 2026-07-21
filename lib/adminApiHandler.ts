import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { supabase } from '@/lib/sejongDataHandler';

const boardToFileMap: Record<string, string> = {
    'baking': 'baking_posts.json',
    'cake': 'cake_posts.json',
    'cooking': 'cooking_posts.json',
    'dessert': 'dessert_posts.json',
    'popups': 'popups.json',
    'teachers': 'teachers.json',
    'attendance': 'attendance.json',
    'visitors': 'visitors.json',
    'members': 'members.json',
    'payments': 'payments.json',
    'holidays': 'holidays.json',
    'settings': 'settings.json',
    'timetable': 'timetable_page.json'
};

const SUPABASE_BOARDS = ['qna', 'review', 'job-openings', 'job-seekers'];

function getSupabaseTableName(board: string) {
    return board.replace(/-/g, '_');
}

async function sendEmailNotification(board: string, item: any) {
    const boardNames: Record<string, string> = {
        'qna': '질문답변(QnA)',
        'review': '수강후기',
        'job-openings': '구인(학원/기업)',
        'job-seekers': '구직(강사/지원자)'
    };
    const boardName = boardNames[board] || board;
    
    // Strip HTML for email readability
    const stripHtml = (html: string) => {
        if (!html) return '';
        return html.replace(/<[^>]*>?/gm, ' ').replace(/\s\s+/g, ' ').trim();
    };

    const emailData = {
        _subject: `[세종요리제과기술학원] 새로운 ${boardName} 게시글 - ${item.author || item.name || '작성자 미상'}`,
        '게시판명': boardName,
        '제목': item.title || '제목 없음',
        '작성자': item.author || item.name || '작성자 미상',
        '내용요약': stripHtml(item.content).substring(0, 500),
        '등록일': item.date || new Date().toISOString().split('T')[0]
    };

    try {
        fetch('https://formsubmit.co/ajax/ojaeeul@naver.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(emailData)
        }).catch(e => console.error("Formsubmit 1 error", e));
        
        fetch('https://formsubmit.co/ajax/leemisun2387@gmail.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(emailData)
        }).catch(e => console.error("Formsubmit 2 error", e));
    } catch (e) {
        console.error("Email send failed", e);
    }
}

function getFilePath(board: string) {
    if (boardToFileMap[board]) {
        return path.join(process.cwd(), 'public', 'data', boardToFileMap[board]);
    }
    let filename = `${board.replace(/-/g, '_')}_data.json`;
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
    if (SUPABASE_BOARDS.includes(board)) {
        try {
            const { data, error } = await supabase
                .from(getSupabaseTableName(board))
                .select('*')
                .order('date', { ascending: false });
                
            if (error) throw error;
            return NextResponse.json(data);
        } catch (error: any) {
            return NextResponse.json({ error: 'Failed to read from Supabase', details: error.message }, { status: 500 });
        }
    }

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
        
        if (SUPABASE_BOARDS.includes(board)) {
            const newItem = {
                id: body.id || String(Date.now()),
                title: body.title || "",
                author: body.author || "",
                date: body.date || new Date().toISOString().split('T')[0],
                hit: String(body.hit || body.hits || "0"),
                content: body.content || ""
            };
            
            // Note: job_openings and job_seekers use 'hits' int8, while others use 'hit' text.
            // Let's coerce it to the correct format based on the board
            if (board === 'job-openings' || board === 'job-seekers') {
                (newItem as any).hits = parseInt((newItem as any).hit, 10) || 0;
                delete (newItem as any).hit;
            }

            const { data, error } = await supabase
                .from(getSupabaseTableName(board))
                .insert([newItem])
                .select();
                
            if (error) throw error;
            
            // SEND EMAIL NOTIFICATION
            await sendEmailNotification(board, newItem);
            
            return NextResponse.json({ success: true, item: data[0] });
        }

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

        if (SUPABASE_BOARDS.includes(board)) {
            const { id, ...updateData } = body;
            const { data, error } = await supabase
                .from(getSupabaseTableName(board))
                .update(updateData)
                .eq('id', id)
                .select();
                
            if (error) throw error;
            return NextResponse.json({ success: true, item: data[0] });
        }

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

        if (SUPABASE_BOARDS.includes(board)) {
            const { error } = await supabase
                .from(getSupabaseTableName(board))
                .delete()
                .eq('id', id);
                
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        let data = await readData(board);
        data = data.filter((item: any) => String(item.id) !== String(id));

        await writeData(board, data);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to delete data', details: error.message }, { status: 500 });
    }
}
