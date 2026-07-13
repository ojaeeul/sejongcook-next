import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function sync() {
    const dataDir = path.join(process.cwd(), 'Sejong/SejongAttendance/data');
    const members = JSON.parse(fs.readFileSync(path.join(dataDir, 'members.json'), 'utf-8'));
    const attendance = JSON.parse(fs.readFileSync(path.join(dataDir, 'attendance.json'), 'utf-8'));
    const payments = JSON.parse(fs.readFileSync(path.join(dataDir, 'payments.json'), 'utf-8'));

    console.log(`Syncing ${members.length} members...`);
    const { error: err1 } = await supabase.from('members').upsert(members);
    if (err1) console.error("Members error:", err1.message);

    console.log(`Syncing ${attendance.length} attendance records...`);
    const { error: err2 } = await supabase.from('attendance').upsert(attendance);
    if (err2) console.error("Attendance error:", err2.message);

    console.log(`Syncing ${payments.length} payment records...`);
    const { error: err3 } = await supabase.from('payments').upsert(payments);
    if (err3) console.error("Payments error:", err3.message);

    console.log("Sync complete.");
}
sync();
