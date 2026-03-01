import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data } = await supabase.from('board_posts').select('*').eq('board_type', 'footer');
    console.log("FOOTER:", JSON.stringify(data, null, 2));

    const { data: sData } = await supabase.from('board_posts').select('*').eq('board_type', 'settings');
    console.log("SETTINGS:", JSON.stringify(sData, null, 2));
}
check();
