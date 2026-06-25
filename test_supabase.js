const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envContent = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);

if (urlMatch && keyMatch) {
    const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());
    supabase.from('members').select('*').limit(1).then(res => {
        console.log("Existing columns:", res.data ? Object.keys(res.data[0]) : "No data");
    });
} else {
    console.log("No Supabase config found in .env.local");
}
