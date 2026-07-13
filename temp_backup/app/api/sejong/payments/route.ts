import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export const dynamic = 'force-dynamic';

export async function GET() {
    const { data: list, error } = await supabase.from('payments').select('*');
    if (error) {
        console.error("GET Payments Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(list || []);
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        const normalizeCourse = (c: string | null | undefined) => (!c || c === 'null') ? null : String(c).trim();
        const courseToMatch = normalizeCourse(data.course);

        // Remove existing to simulate upsert without complex unique constraints on nulls
        let delQ = supabase.from('payments')
            .delete()
            .eq('memberId', data.memberId)
            .eq('year', data.year)
            .eq('month', data.month);

        if (courseToMatch) {
            delQ = delQ.eq('course', courseToMatch);
        } else {
            delQ = delQ.is('course', null);
        }
        await delQ;

        // Ensure course is standardized before insert
        data.course = courseToMatch;
        const { error: insErr } = await supabase.from('payments').insert(data);
        if (insErr) throw insErr;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST Payments Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
