import { NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export const dynamic = 'force-dynamic';

export async function GET() {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'timetable').maybeSingle();

    if (error) {
        console.error("GET Timetable Error:", error);
    }

    return NextResponse.json(data?.value || {});
}
