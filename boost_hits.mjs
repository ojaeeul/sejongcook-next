import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const SUPABASE_BOARDS = ['qna', 'review', 'job-openings', 'job-seekers', 'notice'];

async function updateSupabase() {
    for (const board of SUPABASE_BOARDS) {
        const tableName = board.replace(/-/g, '_');
        console.log(`Fetching ${tableName}...`);
        const { data, error } = await supabase.from(tableName).select('*');
        if (error) {
            console.error(`Error fetching ${tableName}:`, error);
            continue;
        }
        
        console.log(`Updating ${data?.length || 0} posts in ${tableName}...`);
        for (const item of data || []) {
            // Set random target hit count between 750 and 990
            const targetHit = 750 + Math.floor(Math.random() * 240);
            if (board === 'job-openings' || board === 'job-seekers') {
                const current = parseInt(item.hits, 10) || 0;
                if (current < targetHit) {
                    await supabase.from(tableName).update({ hits: targetHit }).eq('id', item.id);
                }
            } else {
                const current = parseInt(item.hit, 10) || 0;
                if (current < targetHit) {
                    await supabase.from(tableName).update({ hit: String(targetHit) }).eq('id', item.id);
                }
            }
        }
    }
}

const JSON_BOARDS = ['baking_posts.json', 'cooking_posts.json', 'dessert_posts.json', 'honor_data.json', 'cake_posts.json'];

async function updateJson() {
    const dataDir = path.join(process.cwd(), 'public', 'data');
    for (const file of JSON_BOARDS) {
        const filePath = path.join(dataDir, file);
        if (fs.existsSync(filePath)) {
            let data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            let updated = false;
            if (Array.isArray(data)) {
                for (let i = 0; i < data.length; i++) {
                    const targetHit = 750 + Math.floor(Math.random() * 240);
                    const current = parseInt(data[i].hit || data[i].hits || '0', 10);
                    if (current < targetHit) {
                        data[i].hit = String(targetHit);
                        updated = true;
                    }
                }
            }
            if (updated) {
                fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
                
                // Copy to Sejong path as well for persistence
                const sejongPath = path.join(process.cwd(), 'Sejong', 'SejongAttendance', 'public', 'data', file);
                if (fs.existsSync(path.dirname(sejongPath))) {
                    fs.writeFileSync(sejongPath, JSON.stringify(data, null, 4));
                }
                
                console.log(`Updated ${file}`);
            }
        }
    }
}

async function run() {
    await updateSupabase();
    await updateJson();
    console.log("Done");
}

run();
