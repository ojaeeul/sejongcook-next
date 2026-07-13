import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export const dynamic = 'force-dynamic';

export async function GET() {
    const { data: list, error } = await supabase.from('members').select('*');
    if (error) {
        console.error("GET Members Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(list || []);
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // 1. Assign ID if missing
        if (!data.id) {
            data.id = String(Date.now());
        }

        // 2. Assign registeredDate if missing
        if (!data.registeredDate) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            data.registeredDate = `${yyyy}-${mm}-${dd}`;
        }

        const { error } = await supabase.from('members').upsert(data);
        if (error) throw error;

        return NextResponse.json({ success: true, data });
    } catch (e: any) {
        console.error("POST Members Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        let memberId = searchParams.get('id');

        if (!memberId) {
            try {
                const body = await req.json();
                memberId = body.id;
            } catch { }
        }

        if (!memberId) {
            return NextResponse.json({ error: 'Missing member ID' }, { status: 400 });
        }

        const { error } = await supabase.from('members').delete().eq('id', memberId);
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("DELETE Members Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
