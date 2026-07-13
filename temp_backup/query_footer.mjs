import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: footerData, error: footerError } = await supabase.from('board_posts').select('*').eq('board_type', 'footer');
    if (footerError) console.error("Footer Error:", footerError);
    console.log("FOOTER:", JSON.stringify(footerData, null, 2));

    const { data: settingsData, error: settingsError } = await supabase.from('board_posts').select('*').eq('board_type', 'settings');
    if (settingsError) console.error("Settings Error:", settingsError);
    console.log("SETTINGS:", JSON.stringify(settingsData, null, 2));
}
check();
