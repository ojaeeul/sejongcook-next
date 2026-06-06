import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabase.from('popups').select('*').order('id', { ascending: true });
        if (error) throw error;
        
        // Extract startDate and endDate from content JSONB if they exist
        const mappedData = (data || []).map(p => {
            if (p.content && typeof p.content === 'object') {
                p.startDate = p.content.startDate;
                p.endDate = p.content.endDate;
            }
            return p;
        });
        
        return NextResponse.json(mappedData);
    } catch (error) {
        console.error('Error reading popups data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        
        // Move startDate and endDate into content JSONB to avoid schema errors
        const mappedData = data.map((p: any) => {
            const copy = { ...p };
            if (copy.startDate || copy.endDate) {
                if (!copy.content) copy.content = {};
                if (copy.startDate) copy.content.startDate = copy.startDate;
                if (copy.endDate) copy.content.endDate = copy.endDate;
            } else if (copy.content) {
                // If they were cleared, remove from content
                delete copy.content.startDate;
                delete copy.content.endDate;
            }
            // Delete from root so Supabase doesn't complain about missing columns
            delete copy.startDate;
            delete copy.endDate;
            return copy;
        });
        
        // Upsert new data
        const { error } = await supabase.from('popups').upsert(mappedData);
        if (error) throw error;

        // Delete what's missing
        const { data: existing } = await supabase.from('popups').select('id');
        if (existing) {
            const incomingIds = mappedData.map((p: any) => p.id).filter(Boolean);
            const toDelete = existing.filter((p: any) => !incomingIds.includes(p.id)).map(p => p.id);
            if (toDelete.length > 0) {
                await supabase.from('popups').delete().in('id', toDelete);
            }
        }
        return NextResponse.json({ success: true, message: 'Popups updated successfully' });
    } catch (error) {
        console.error('Error replacing popups data:', error);
        return NextResponse.json({ error: 'Failed to replace data' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const item = await request.json();
        
        // Move startDate and endDate into content JSONB
        const mappedItem = { ...item };
        if (mappedItem.startDate || mappedItem.endDate) {
            if (!mappedItem.content) mappedItem.content = {};
            if (mappedItem.startDate) mappedItem.content.startDate = mappedItem.startDate;
            if (mappedItem.endDate) mappedItem.content.endDate = mappedItem.endDate;
        } else if (mappedItem.content) {
            delete mappedItem.content.startDate;
            delete mappedItem.content.endDate;
        }
        delete mappedItem.startDate;
        delete mappedItem.endDate;

        const { error } = await supabase.from('popups').upsert(mappedItem);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating popup:', error);
        return NextResponse.json({ error: 'Failed to update data' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
        
        const { error } = await supabase.from('popups').delete().eq('id', id);
        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting popup:', error);
        return NextResponse.json({ error: 'Failed to delete data' }, { status: 500 });
    }
}
