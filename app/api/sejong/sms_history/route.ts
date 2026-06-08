export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export async function GET() {
    try {
        const { data, error } = await supabase.from('settings').select('key, value').like('key', 'sms_history_%');
        if (error) throw error;

        const historyData = data.map(row => ({
            date: row.key.replace('sms_history_', ''),
            messages: row.value
        }));
        return NextResponse.json(historyData || []);
    } catch (e: any) {
        console.error("GET SMS History Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const dateStr = body.date; // e.g. "2026-05-25"
        const newMessages = body.messages.map((m: any) => ({
            ...m,
            timestamp: new Date().toISOString()
        }));

        const key = `sms_history_${dateStr}`;

        // Get existing messages for this date
        const { data: existingData } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
        
        let messages = [];
        if (existingData && Array.isArray(existingData.value)) {
            messages = existingData.value;
        }

        messages.push(...newMessages);

        // Save back to settings table
        const { error } = await supabase.from('settings').upsert({ key, value: messages }, { onConflict: 'key' });
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST SMS History Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
