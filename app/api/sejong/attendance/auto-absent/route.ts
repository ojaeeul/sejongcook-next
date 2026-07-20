export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export async function POST(req: NextRequest) {
    try {
        // 1. Fetch required data
        const [timetableRes, holidaysRes, membersRes] = await Promise.all([
            supabase.from('settings').select('value').eq('key', 'timetable').maybeSingle(),
            supabase.from('settings').select('value').eq('key', 'holidays').maybeSingle(),
            supabase.from('members').select('*')
        ]);

        const timetableData = timetableRes.data?.value || {};
        const holidaysData = holidaysRes.data?.value || [];
        const members = membersRes.data || [];
        
        // Filter out inactive members
        const activeMembers = members.filter(m => 
            m.status !== '수료' && m.status !== '환불' && m.status !== '퇴원' && m.status !== '휴학'
        );

        // 2. Determine target dates
        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
        const currentHour = now.getHours();
        
        const targetDates: { date: string, dayOfWeek: number }[] = [];
        // Look back up to 7 days
        for (let i = 0; i <= 7; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            
            // Skip today if it's before 8 PM (20:00)
            if (i === 0 && currentHour < 20) {
                continue;
            }

            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const dateStr = `${yyyy}-${mm}-${dd}`;
            
            // Skip holidays
            const isHoliday = holidaysData.some((h: any) => h.date === dateStr && h.isHoliday);
            if (isHoliday) {
                continue;
            }
            
            targetDates.push({ date: dateStr, dayOfWeek: d.getDay() }); // 0=Sun, 1=Mon...
        }

        if (targetDates.length === 0) {
            return NextResponse.json({ success: true, message: 'No target dates to process' });
        }

        const dateStrings = targetDates.map(td => td.date);

        // 3. Fetch existing attendance for these dates
        const { data: attendanceData, error: attErr } = await supabase
            .from('attendance')
            .select('*')
            .in('date', dateStrings);
            
        if (attErr) throw attErr;

        // 4. Determine missing attendances
        const newLogs: any[] = [];
        
        activeMembers.forEach(m => {
            if (!m.course) return;
            
            const memberCourses = m.course.split(',').map((c: string) => c.trim()).filter((c: string) => c);
            if (memberCourses.length === 0) return;
            
            targetDates.forEach(td => {
                // If member registered after this date, skip
                if (m.registeredDate && td.date < m.registeredDate) return;
                
                memberCourses.forEach((courseNameScope: string) => {
                    let cleanCourseName = courseNameScope;
                    const match = courseNameScope.match(/(.*?)\((.*?)\)/);
                    if (match) {
                        cleanCourseName = match[1].trim();
                    }
                    
                    let courseAllowedDays: number[] = [];
                    if (timetableData[cleanCourseName]) {
                        courseAllowedDays = timetableData[cleanCourseName];
                    } else if (timetableData[courseNameScope]) {
                        courseAllowedDays = timetableData[courseNameScope];
                    }
                    
                    if (courseAllowedDays.includes(td.dayOfWeek)) {
                        // Check if there is an attendance record
                        const hasRecord = (attendanceData || []).some(r => 
                            r.memberId === m.id && r.date === td.date && (r.course === courseNameScope || r.course === cleanCourseName || !r.course)
                        );
                        
                        if (!hasRecord) {
                            newLogs.push({
                                memberId: m.id,
                                date: td.date,
                                status: 'absent',
                                course: courseNameScope
                            });
                        }
                    }
                });
            });
        });

        // 5. Insert missing
        if (newLogs.length > 0) {
            // Deduplicate in case multiple conditions pushed the same member/date/course
            const uniqueLogsMap = new Map();
            newLogs.forEach(log => {
                uniqueLogsMap.set(`${log.memberId}_${log.date}_${log.course}`, log);
            });
            const uniqueLogs = Array.from(uniqueLogsMap.values());
            
            const { error: insErr } = await supabase.from('attendance').insert(uniqueLogs);
            if (insErr) throw insErr;
            
            return NextResponse.json({ success: true, insertedCount: uniqueLogs.length, logs: uniqueLogs });
        }

        return NextResponse.json({ success: true, insertedCount: 0, message: 'No new absentees found' });

    } catch (e: any) {
        console.error("POST Auto Absent Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
