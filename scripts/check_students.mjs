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

    for (const m of members) {
        if (!m.course) continue;
        const courses = m.course.split(',').map(c => c.trim());
        for (const c of courses) {
            if (c === '제과' || c === '제빵' || c === '한식') {
                console.log(`Match: ${m.name} | Course: ${m.course} | School: ${m.school}`);
                break;
            } else if (c.includes('제과') && !c.includes('기능사') && !c.includes('제빵')) {
                 console.log(`Partial match 제과: ${m.name} | Course: ${m.course}`);
            } else if (c.includes('제빵') && !c.includes('기능사') && !c.includes('제과')) {
                 console.log(`Partial match 제빵: ${m.name} | Course: ${m.course}`);
            } else if (c.includes('한식') && !c.includes('기능사')) {
                 console.log(`Partial match 한식: ${m.name} | Course: ${m.course}`);
            }
        }
    }
}
main();
