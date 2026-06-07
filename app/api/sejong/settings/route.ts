export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export async function GET() {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'settings').maybeSingle();

    if (error) {
        console.error("GET Settings Error:", error);
    }

    let settings = data?.value;
    if (!settings || (Array.isArray(settings) && settings.length === 0)) {
        settings = { courseFees: {} };
    }
    return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        const { error } = await supabase.from('settings').upsert({ key: 'settings', value: payload }, { onConflict: 'key' });
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST Settings Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
