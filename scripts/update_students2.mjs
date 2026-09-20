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
        
        const courses = m.course.split(',').map(c => c.trim());
        let modified = false;

        let isMiddleSchool = false;
        if (m.school && m.school.includes('중')) isMiddleSchool = true;
        if (m.school_level && m.school_level.includes('중')) isMiddleSchool = true;
        
        const newTime = isMiddleSchool ? '17:00' : '19:00';

        const newCourses = courses.map((c, i) => {
            let isTarget = false;
            let baseCourse = "";
            
            if (c.startsWith('제과') && !c.includes('기능사') && !c.includes('제빵')) {
                isTarget = true;
                baseCourse = "제과기능사";
            } else if (c.startsWith('제빵') && !c.includes('기능사') && !c.includes('제과')) {
                isTarget = true;
                baseCourse = "제빵기능사";
            } else if (c.startsWith('한식') && !c.includes('기능사')) {
                isTarget = true;
                baseCourse = "한식기능사";
            }
            
            if (isTarget) {
                modified = true;
                return `${baseCourse}(${newTime})`;
            }
            return c;
        });

        if (modified) {
            const newCourseStr = newCourses.join(', ');
            
            // TimeSlot
            let newTimeSlot = m.timeSlot || "";
            if (m.timeSlot) {
                const slots = m.timeSlot.split(',').map(s => s.trim());
                for (let i=0; i<courses.length; i++) {
                    let isTarget = false;
                    const c = courses[i];
                    if (c.startsWith('제과') && !c.includes('기능사') && !c.includes('제빵')) isTarget = true;
                    if (c.startsWith('제빵') && !c.includes('기능사') && !c.includes('제과')) isTarget = true;
                    if (c.startsWith('한식') && !c.includes('기능사')) isTarget = true;

                    if (isTarget) {
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
                // Actually if there are multiple courses and no time slot, we should ideally create a matched array but this is fallback.
            }

            console.log(`Update: ${m.name.padEnd(5, ' ')} | School: ${(m.school||'')} -> Time: ${newTime} | Course: ${m.course} => ${newCourseStr}`);
            
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
