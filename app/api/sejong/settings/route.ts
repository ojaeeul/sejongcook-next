export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export async function GET() {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'settings').maybeSingle();

    if (error) {
        console.error("GET Settings Error:", error);
    }

    let settings = data?.value;
    
    // Fix: If the database stored it as an array (legacy format), extract the first object
    if (Array.isArray(settings)) {
        settings = settings.length > 0 ? settings[0] : {};
    }
    
    if (!settings) {
        settings = { courseFees: {} };
    }
    return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
    try {
        let payload = await req.json();

        // Ensure we always save an object, never an array
        if (Array.isArray(payload)) {
            payload = payload.length > 0 ? payload[0] : {};
        }

        const { error } = await supabase.from('settings').upsert({ key: 'settings', value: payload }, { onConflict: 'key' });
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST Settings Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
