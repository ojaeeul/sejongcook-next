export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export async function GET() {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'explanation_settings').maybeSingle();

    if (error) {
        console.error("GET Explanation Settings Error:", error);
    }

    let settings = data?.value;
    
    if (Array.isArray(settings)) {
        settings = settings.length > 0 ? settings[0] : {};
    }
    
    if (!settings) {
        settings = { global_enabled: false, allowed_students: [] };
    }
    return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
    try {
        let payload = await req.json();

        if (Array.isArray(payload)) {
            payload = payload.length > 0 ? payload[0] : {};
        }

        const { error } = await supabase.from('settings').upsert({ key: 'explanation_settings', value: payload }, { onConflict: 'key' });
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST Explanation Settings Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
