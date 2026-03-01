import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_DIR_PUBLIC = path.join(process.cwd(), 'public', 'data');
const DATA_DIR_APP = path.join(process.cwd(), 'app', 'data');

const CUSTOM_BOARDS = {
    'gallery': path.join(DATA_DIR_PUBLIC, 'gallery_data.json'),
    'honor': path.join(DATA_DIR_PUBLIC, 'honor_data.json'),
    'popups': path.join(DATA_DIR_PUBLIC, 'popups.json'),
    'sites': path.join(DATA_DIR_PUBLIC, 'sites_data.json'),
    'settings': path.join(DATA_DIR_PUBLIC, 'settings.json'),
    'footer': path.join(DATA_DIR_APP, 'footer_data.json')
};

async function migrateCustomBoards() {
    console.log("Starting custom board data migration to Supabase...");

    for (const [boardType, filePath] of Object.entries(CUSTOM_BOARDS)) {
        if (!fs.existsSync(filePath)) {
            console.log(`[SKIP] Missing file for ${boardType}: ${filePath}`);
            continue;
        }

        try {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            let data = JSON.parse(fileContent);

            // Some files might just be single objects instead of arrays (e.g. settings)
            if (!Array.isArray(data)) {
                data = [data];
            }

            if (data.length === 0) {
                console.log(`[SKIP] No data in ${boardType}`);
                continue;
            }

            console.log(`[${boardType}] Migrating ${data.length} records...`);

            // Clear existing data for this board to avoid duplicates or orphaned rows
            await supabase.from('board_posts').delete().eq('board_type', boardType);

            const preparedData = data.map((item, index) => {
                // Ensure there's an ID
                const id = item.id ? String(item.id) : String(Date.now() + index);

                const record = {
                    board_type: boardType,
                    id: id,
                    title: item.title || '',
                    author: item.author || '',
                    content: JSON.stringify(item), // Serialize the WHOLE item into content!
                    date: item.date || item.created_at || new Date().toISOString().split('T')[0],
                    hit: Number(item.hit) || 0,
                    status: item.status || null,
                    link: item.link || null,
                    institution: item.institution || null,
                    file: item.file || null
                };
                return record;
            });

            const { error } = await supabase
                .from('board_posts')
                .insert(preparedData);

            if (error) {
                console.error(`[ERROR] Failed to migrate ${boardType}:`, error.message);
            } else {
                console.log(`[SUCCESS] Migrated ${boardType}`);
            }

        } catch (e) {
            console.error(`[ERROR] Processing ${boardType}:`, e.message);
        }
    }

    console.log("Custom board migration complete!");
}

migrateCustomBoards();
