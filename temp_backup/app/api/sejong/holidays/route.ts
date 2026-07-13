import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export const dynamic = 'force-dynamic';

export async function GET() {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'holidays').maybeSingle();

    if (error) {
        console.error("GET Holidays Error:", error);
    }

    return NextResponse.json(data?.value || []);
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json(); // { date, isHoliday }

        // Fetch current
        const { data } = await supabase.from('settings').select('value').eq('key', 'holidays').maybeSingle();
        let holidays: any[] = data?.value || [];

        // Remove existing for date
        holidays = holidays.filter((h) => h.date !== payload.date);

        if (payload.isHoliday) {
            holidays.push(payload);
        }

        // Upsert back
        const { error } = await supabase.from('settings').upsert({ key: 'holidays', value: holidays }, { onConflict: 'key' });
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST Holidays Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
