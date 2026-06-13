export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export async function GET() {
    const { data, error } = await supabase.from('settings').select('value').eq('key', 'expense_notebook').maybeSingle();

    if (error) {
        console.error("GET Expense Notebook Error:", error);
    }

    const htmlData = data?.value || {};
    return NextResponse.json(htmlData);
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        const { error } = await supabase.from('settings').upsert({ key: 'expense_notebook', value: payload }, { onConflict: 'key' });
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST Expense Notebook Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
