import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking...", supabaseUrl);
    const { data, error } = await supabase.from('board_posts').select('board_type');
    if (error) {
        console.error("Error:", error);
        return;
    }
    const counts = {};
    for (const row of data) {
        counts[row.board_type] = (counts[row.board_type] || 0) + 1;
    }
    console.log("Supabase board_posts counts:", counts);
}
check();
