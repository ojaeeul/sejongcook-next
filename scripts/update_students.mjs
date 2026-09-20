import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: members, error } = await supabase.from('members').select('*');
    if (error) {
        console.error("Error fetching members:", error);
        return;
    }

    let updatedCount = 0;
    
    for (const m of members) {
        if (!m.course) continue;
        
        if (m.course === '제과제빵' || (m.course.includes('제과제빵') && !m.course.includes('기능사'))) {
            let isMiddleSchool = false;
            if (m.school && m.school.includes('중')) isMiddleSchool = true;
            if (m.school_level && m.school_level.includes('중')) isMiddleSchool = true;
            
            const newTime = isMiddleSchool ? '17:00' : '19:00';
            
            // Reconstruct the course string (replace '제과제빵' with '제과제빵기능사(time)')
            const courses = m.course.split(',').map(c => c.trim());
            const newCourses = courses.map(c => {
                if (c.startsWith('제과제빵') && !c.includes('기능사')) {
                    return `제과제빵기능사(${newTime})`;
                }
                return c;
            });
            const newCourseStr = newCourses.join(', ');
            
            // TimeSlot
            let newTimeSlot = m.timeSlot || "";
            if (m.timeSlot) {
                const slots = m.timeSlot.split(',').map(s => s.trim());
                for (let i=0; i<courses.length; i++) {
                    if (courses[i].startsWith('제과제빵') && !courses[i].includes('기능사')) {
                        // Ensure slots array is long enough
                        if (slots.length > i) {
                            slots[i] = newTime;
                        } else {
                            slots.push(newTime);
                        }
                    }
                }
                newTimeSlot = slots.join(',');
            } else {
                newTimeSlot = newTime;
            }

            console.log(`Updating: ${m.name} -> ${newCourseStr}`);
            
            const { error: updateError } = await supabase
                .from('members')
                .update({ course: newCourseStr, timeSlot: newTimeSlot })
                .eq('id', m.id);
                
            if (updateError) {
                console.error("  Update error:", updateError);
            } else {
                updatedCount++;
            }
        }
    }
    
    console.log(`Total updated: ${updatedCount}`);
}

main();
