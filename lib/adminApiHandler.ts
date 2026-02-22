import { NextRequest, NextResponse } from 'next/server';
import { supabase } from './sejongDataHandler';

export async function handleReplace(request: NextRequest, board: string) {
    const body = await request.json();

    try {
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Invalid data format. Expected array.' }, { status: 400 });
        }

        // To replace all data, we first delete existing records for this board_type
        await supabase.from('board_posts').delete().eq('board_type', board);

        if (body.length > 0) {
            const isCustom = ['gallery', 'popups', 'honor', 'sites', 'footer', 'settings'].includes(board);
            const preparedData = body.map(item => ({
                board_type: board,
                id: String(item.id),
                title: item.title || '',
                author: item.author || '',
                content: isCustom ? JSON.stringify(item) : (item.content || ''),
                date: item.date || new Date().toISOString().split('T')[0],
                hit: Number(item.hit) || 0,
                status: item.status || null,
                link: item.link || null,
                institution: item.institution || null,
                file: item.file || null
            }));

            const { error } = await supabase.from('board_posts').insert(preparedData);
            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Replace error:', error);
        return NextResponse.json({ error: 'Failed to save data', details: error.message }, { status: 500 });
    }
}

export async function handleGet(request: NextRequest, board: string) {
    try {
        const { data, error } = await supabase
            .from('board_posts')
            .select('*')
            .eq('board_type', board)
            .order('id', { ascending: true }); // Depending on frontend expectation, might need numeric sorting

        if (error) throw error;

        const isCustom = ['gallery', 'popups', 'honor', 'sites', 'footer', 'settings'].includes(board);
        const mappedData = (data || []).map(row => {
            if (isCustom && row.content) {
                try {
                    const parsed = JSON.parse(row.content);
                    return { ...row, ...parsed };
                } catch {
                    return row;
                }
            }
            return row;
        });

        return NextResponse.json(mappedData);
    } catch (error: any) {
        console.error('Read error:', error);
        return NextResponse.json({
            error: 'Failed to read data',
            details: error.message
        }, { status: 500 });
    }
}

export async function handlePost(request: NextRequest, board: string) {
    try {
        const body = await request.json();

        // Special handling for full array replacement
        if (Array.isArray(body)) {
            return await handleReplace(request, board);
        }

        // Generate a new ID based on existing records
        const { data: existingData } = await supabase
            .from('board_posts')
            .select('id')
            .eq('board_type', board);

        const newId = (existingData && existingData.length > 0)
            ? String(Math.max(...existingData.map(item => Number(item.id) || 0)) + 1)
            : "1";

        const isCustom = ['gallery', 'popups', 'honor', 'sites', 'footer', 'settings'].includes(board);
        const newItem = {
            board_type: board,
            id: newId,
            title: body.title || '',
            author: body.author || '',
            content: isCustom ? JSON.stringify(body) : (body.content || ''),
            date: body.date || new Date().toISOString().split('T')[0],
            hit: body.hit || 0,
            status: body.status || null,
            link: body.link || null,
            institution: body.institution || null,
            file: body.file || null
        };

        const { error } = await supabase.from('board_posts').insert(newItem);
        if (error) throw error;

        return NextResponse.json({ success: true, item: newItem });
    } catch (error: any) {
        console.error('Write error:', error);
        return NextResponse.json({ error: 'Failed to save data', details: error.message }, { status: 500 });
    }
}

export async function handlePut(request: NextRequest, board: string) {
    try {
        const body = await request.json();

        if (!body.id) return NextResponse.json({ error: 'Missing item ID' }, { status: 400 });

        const isCustom = ['gallery', 'popups', 'honor', 'sites', 'footer', 'settings'].includes(board);
        const updateData = {
            title: body.title || '',
            author: body.author || '',
            content: isCustom ? JSON.stringify(body) : (body.content || ''),
            date: body.date || new Date().toISOString().split('T')[0],
            hit: body.hit || 0,
            status: body.status || null,
            link: body.link || null,
            institution: body.institution || null,
            file: body.file || null
        };

        // Update record in Supabase
        // We ensure we only update the record belonging to this board_type
        const { data, error } = await supabase
            .from('board_posts')
            .update(updateData)
            .eq('board_type', board)
            .eq('id', String(body.id))
            .select()
            .single();

        if (error) throw error;
        if (!data) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

        return NextResponse.json({ success: true, item: data });
    } catch (error: any) {
        console.error('Update error:', error);
        return NextResponse.json({ error: 'Failed to update data', details: error.message }, { status: 500 });
    }
}

export async function handleDelete(request: NextRequest, board: string) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Invalid request: missing id' }, { status: 400 });

        const { error } = await supabase
            .from('board_posts')
            .delete()
            .eq('board_type', board)
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Failed to delete data', details: error.message }, { status: 500 });
    }
}
