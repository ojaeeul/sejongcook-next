import { NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export async function GET() {
    try {
        const { data, error } = await supabase.from('notice').select('id').limit(1);
        if (error) throw error;
        return NextResponse.json({ status: 'ok', time: new Date().toISOString() });
    } catch (e) {
        return NextResponse.json({ status: 'error' }, { status: 500 });
    }
}
