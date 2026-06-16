export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const year = url.searchParams.get('year');
    
    if (year === 'all') {
        const { data, error } = await supabase.from('settings').select('value').like('key', 'expense_notebook%');
        if (error) {
            console.error("GET All Expense Notebooks Error:", error);
            return NextResponse.json([]);
        }
        return NextResponse.json(data ? data.map(d => d.value) : []);
    }

    // Default to 'expense_notebook' for 2026 or when year is not specified to preserve backwards compatibility
    const key = (!year || year === '2026') ? 'expense_notebook' : `expense_notebook_${year}`;

    const { data, error } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();

    if (error) {
        console.error("GET Expense Notebook Error:", error);
    }

    const htmlData = data?.value || {};
    return NextResponse.json(htmlData);
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        const year = payload.expenseYear;
        
        const key = (!year || year === '2026') ? 'expense_notebook' : `expense_notebook_${year}`;

        const { error } = await supabase.from('settings').upsert({ key: key, value: payload }, { onConflict: 'key' });
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST Expense Notebook Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
