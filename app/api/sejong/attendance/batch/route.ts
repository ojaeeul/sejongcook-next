export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { memberId, dates, status, course } = body;

        if (!memberId || !dates || !Array.isArray(dates)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        if (course === 'ALL') {
            const { error: delErr } = await supabase.from('attendance')
                .delete()
                .eq('memberId', memberId)
                .in('date', dates);
            if (delErr) throw delErr;
        } else if (course) {
            // Handle specific course deletion, including cases where old records have comma-separated courses
            const { data: rows } = await supabase.from('attendance')
                .select('*')
                .eq('memberId', memberId)
                .in('date', dates);
            
            if (rows) {
                for (const row of rows) {
                    const rowCourse = row.course || '';
                    if (rowCourse === course) {
                        await supabase.from('attendance')
                            .delete()
                            .eq('memberId', memberId)
                            .eq('date', row.date)
                            .eq('course', rowCourse);
                    } else if (rowCourse.includes(course)) {
                        const cList = rowCourse.split(',').map((c: string) => c.trim()).filter((c: string) => c !== course);
                        if (cList.length > 0) {
                            await supabase.from('attendance')
                                .update({ course: cList.join(', ') })
                                .eq('memberId', memberId)
                                .eq('date', row.date)
                                .eq('course', rowCourse);
                        } else {
                            await supabase.from('attendance')
                                .delete()
                                .eq('memberId', memberId)
                                .eq('date', row.date)
                                .eq('course', rowCourse);
                        }
                    }
                }
            }
        } else {
            const { error: delErr } = await supabase.from('attendance')
                .delete()
                .eq('memberId', memberId)
                .in('date', dates)
                .is('course', null);
            if (delErr) throw delErr;
        }

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
