import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function init() {
    console.log("Checking storage buckets...");
    const { data: buckets } = await supabase.storage.listBuckets();
    let hasAssetsBucket = buckets?.some(b => b.name === 'public_assets');
    
    if (!hasAssetsBucket) {
        console.log("Creating bucket 'public_assets'...");
        const { error } = await supabase.storage.createBucket('public_assets', { public: true });
        if (error) console.error("Error creating bucket:", error);
        else console.log("Bucket created.");
    } else {
        console.log("Bucket 'public_assets' already exists.");
    }

    // Since we don't have direct SQL runner in standard REST, we'll just check if the tables exist
    // by doing a quick select. If they fail, we know the user must create them via SQL Editor.
    const { error: tErr } = await supabase.from('teachers').select('id').limit(1);
    console.log("Teachers table check:", tErr ? "Missing or Error" : "Exists");

    const { error: pErr } = await supabase.from('popups').select('id').limit(1);
    console.log("Popups table check:", pErr ? "Missing or Error" : "Exists");
}

init();
