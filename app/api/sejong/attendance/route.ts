export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date');

    let allLogs: any[] = [];
    let from = 0;
    const step = 1000;
    
    while (true) {
        let query = supabase.from('attendance').select('*').range(from, from + step - 1);
        if (date) {
            query = query.eq('date', date);
        }
        
        const { data: logs, error } = await query;
        
        if (error) {
            console.error("GET Attendance Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        if (!logs || logs.length === 0) {
            break;
        }
        
        allLogs = allLogs.concat(logs);
        
        if (logs.length < step) {
            break;
        }
        from += step;
    }

    allLogs.sort((a, b) => {
        if (a.date !== b.date) return String(a.date || '').localeCompare(String(b.date || ''));
        if (a.memberId !== b.memberId) return String(a.memberId || '').localeCompare(String(b.memberId || ''));
        return String(a.course || '').localeCompare(String(b.course || ''));
    });

    return NextResponse.json(allLogs);
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json(); // { memberId, date, status, (optional) course }

        if (data.status === 'unchecked') {
            // Delete matching record
            let delQuery = supabase.from('attendance')
                .delete()
                .eq('memberId', data.memberId)
                .eq('date', data.date);

            if (data.course === 'ALL') {
                // Delete all courses for this member and date
            } else if (data.course) {
                delQuery = delQuery.eq('course', data.course);
            } else {
                delQuery = delQuery.is('course', null);
            }

            const { error } = await delQuery;
            if (error) throw error;
        } else {
            // Upsert / Update logic conceptually:
            // Since there's no unique constraint on (memberId, date, course) in the schema currently,
            // we first check if it exists to update, or just delete then insert to avoid duplicates.

            let delQuery = supabase.from('attendance')
                .delete()
                .eq('memberId', data.memberId)
                .eq('date', data.date);

            if (data.course === 'ALL') {
                // Delete all courses for this member and date
            } else if (data.course) {
                delQuery = delQuery.eq('course', data.course);
            } else {
                delQuery = delQuery.is('course', null);
            }
            await delQuery; // Remove old one first

            // Insert new one
            const { error: insErr } = await supabase.from('attendance').insert(data);
            if (insErr) throw insErr;
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST Attendance Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
