export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
    try {
        const { data, error } = await supabase.from('teachers').select('*').order('order', { ascending: true });
        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error) {
        console.error('Error reading teachers data:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json(); // Array of teachers

        // To support full array replacement like the old JSON method:
        // We delete all and re-insert, or upsert.
        // Since we upsert by ID, let's just upsert all of them.
        const { error } = await supabase.from('teachers').upsert(data);
        if (error) throw error;

        // Optionally, if a teacher was deleted from the UI, we should delete it here too.
        // For simplicity, we can fetch existing IDs and delete those not in `data`.
        const { data: existing } = await supabase.from('teachers').select('id');
        if (existing) {
            const incomingIds = data.map((t: any) => t.id);
            const toDelete = existing.filter((t: any) => !incomingIds.includes(t.id)).map(t => t.id);
            if (toDelete.length > 0) {
                await supabase.from('teachers').delete().in('id', toDelete);
            }
        }

        return NextResponse.json({ success: true, message: 'Teachers updated successfully' });
    } catch (error) {
        console.error('Error saving teachers data:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
