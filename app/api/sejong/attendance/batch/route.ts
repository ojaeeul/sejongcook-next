import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { memberId, dates, status, course } = body;

        if (!memberId || !dates || !Array.isArray(dates)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        // Delete existing logs for the member/course on these dates
        let delQuery = supabase.from('attendance')
            .delete()
            .eq('memberId', memberId)
            .in('date', dates);

        if (course) {
            delQuery = delQuery.eq('course', course);
        } else {
            delQuery = delQuery.is('course', null);
        }

        const { error: delErr } = await delQuery;
        if (delErr) throw delErr;

        // Add new logs if status is not 'unchecked'
        if (status !== 'unchecked') {
            const newLogs = dates.map((date: string) => ({
                memberId,
                date,
                status,
                course
            }));

            const { error: insErr } = await supabase.from('attendance').insert(newLogs);
            if (insErr) throw insErr;
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Batch Attendance Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
