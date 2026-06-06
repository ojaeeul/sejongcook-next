import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function test() {
    const { data: popups } = await supabase.from('popups').select('*').limit(1);
    const p = popups[0];
    p.isActive = !p.isActive;
    
    console.log("Upserting:", p);
    const { data, error } = await supabase.from('popups').upsert([p]);
    console.log("Upsert Error:", error);
}
test();
