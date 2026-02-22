import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export const dynamic = 'force-dynamic';

export async function GET() {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'global').maybeSingle();

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
        const data = await req.json();
        const payload = { key: 'global', value: data };

        const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'key' });
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST Settings Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
