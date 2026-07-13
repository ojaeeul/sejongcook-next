import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

const BOARD_MAP = {
    'notice': 'notice_data.json',
    'qna': 'qna_data.json',
    'job-openings': 'job_openings_data.json',
    'job-seekers': 'job_seekers_data.json',
    'honor': 'honor_data.json',
    'review': 'review_data.json',
    'gallery': 'gallery_data.json',
    'inquiries': 'inquiries_data.json',
    'popups': 'popups.json',
};

async function migrateData() {
    console.log("Starting community board data migration to Supabase...");

    for (const [boardType, fileName] of Object.entries(BOARD_MAP)) {
        const filePath = path.join(DATA_DIR, fileName);
        
        if (!fs.existsSync(filePath)) {
            console.log(`[SKIP] Missing file for ${boardType}: ${fileName}`);
            continue;
        }

        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            const data = JSON.parse(fileContent);

            if (!Array.isArray(data) || data.length === 0) {
                console.log(`[SKIP] No data in ${fileName}`);
                continue;
            }

            console.log(`[${boardType}] Migrating ${data.length} records...`);

            const preparedData = data.map(item => {
                const record = {
                    board_type: boardType,
                    id: String(item.id),
                    title: item.title || '',
                    author: item.author || '',
                    content: item.content || '',
                    date: item.date || new Date().toISOString().split('T')[0],
                    hit: Number(item.hit) || 0,
                };
                
                // Keep specific additional fields
                if (item.status) record.status = item.status;
                if (item.link) record.link = item.link;
                if (item.institution) record.institution = item.institution;
                if (item.file) record.file = item.file;
                
                return record;
            });

            const { error } = await supabase
                .from('board_posts')
                .upsert(preparedData, { onConflict: 'board_type, id' });

            if (error) {
                console.error(`[ERROR] Failed to migrate ${boardType}:`, error.message);
            } else {
                console.log(`[SUCCESS] Migrated ${boardType}`);
            }

        } catch (e) {
            console.error(`[ERROR] Processing ${fileName}:`, e.message);
        }
    }

    console.log("Community board migration complete!");
}

migrateData();
