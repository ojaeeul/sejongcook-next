import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const PUBLIC_DIR = path.join(process.cwd(), 'public');

// Helper to upload file to Supabase Storage and return public URL
async function uploadImageToSupabase(localUrl) {
    if (!localUrl || !localUrl.startsWith('/')) return localUrl; // Already a full URL or empty
    
    const localFilePath = path.join(PUBLIC_DIR, localUrl);
    if (!fs.existsSync(localFilePath)) {
        console.warn(`File not found locally: ${localFilePath}`);
        return localUrl;
    }

    const fileName = path.basename(localFilePath);
    const uniqueFileName = `${Date.now()}_${fileName}`;
    const fileBuffer = fs.readFileSync(localFilePath);
    const mimeType = localUrl.endsWith('.png') ? 'image/png' : (localUrl.endsWith('.jpg') || localUrl.endsWith('.jpeg') ? 'image/jpeg' : 'application/octet-stream');

    console.log(`Uploading ${fileName}...`);
    const { data, error } = await supabase.storage
        .from('public_assets')
        .upload(uniqueFileName, fileBuffer, {
            contentType: mimeType,
            upsert: true
        });

    if (error) {
        console.error(`Failed to upload ${fileName}:`, error);
        return localUrl;
    }

    const { data: publicUrlData } = supabase.storage.from('public_assets').getPublicUrl(uniqueFileName);
    return publicUrlData.publicUrl;
}

async function migrateTeachers() {
    console.log("Migrating Teachers...");
    const teachersPath = path.join(PUBLIC_DIR, 'data', 'teachers.json');
    if (fs.existsSync(teachersPath)) {
        const teachers = JSON.parse(fs.readFileSync(teachersPath, 'utf8'));
        
        for (const teacher of teachers) {
            teacher.image = await uploadImageToSupabase(teacher.image);
            const { error } = await supabase.from('teachers').upsert({
                id: teacher.id,
                name: teacher.name,
                role: teacher.role,
                description: teacher.description,
                image: teacher.image,
                order: teacher.order || 0
            });
            if (error) console.error("Error inserting teacher:", error);
        }
        console.log("Teachers migrated.");
    } else {
        console.log("No teachers.json found.");
    }
}

async function migratePopups() {
    console.log("Migrating Popups...");
    const popupsPath = path.join(PUBLIC_DIR, 'data', 'popups.json');
    if (fs.existsSync(popupsPath)) {
        const popups = JSON.parse(fs.readFileSync(popupsPath, 'utf8'));
        
        for (const popup of popups) {
            popup.imageUrl = await uploadImageToSupabase(popup.imageUrl);
            if (popup.content && popup.content.mainImage) {
                popup.content.mainImage = await uploadImageToSupabase(popup.content.mainImage);
            }
            const { error } = await supabase.from('popups').upsert({
                id: popup.id,
                title: popup.title,
                type: popup.type,
                imageUrl: popup.imageUrl,
                link: popup.link,
                isActive: popup.isActive,
                position: popup.position,
                size: popup.size,
                content: popup.content,
                templateId: popup.templateId
            });
            if (error) console.error("Error inserting popup:", error);
        }
        console.log("Popups migrated.");
    } else {
        console.log("No popups.json found.");
    }
}

async function run() {
    await migrateTeachers();
    await migratePopups();
    console.log("Migration Complete!");
}

run();
