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

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { error } = await supabase.from('settings').upsert(
            { key: 'timetable', value: body },
            { onConflict: 'key' }
        );

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const error = e as Error;
        console.error("POST Timetable Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
