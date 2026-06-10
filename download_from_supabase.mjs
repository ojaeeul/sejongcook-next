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
    
    console.log("Downloading members...");
    const { data: members, error: err1 } = await supabase.from('members').select('*');
    if (err1) console.error("Members error:", err1.message);
    else {
        fs.writeFileSync(path.join(dataDir, 'members.json'), JSON.stringify(members, null, 2));
        console.log(`Saved ${members.length} members.`);
    }

    console.log("Downloading attendance...");
    const { data: attendance, error: err2 } = await supabase.from('attendance').select('*');
    if (err2) console.error("Attendance error:", err2.message);
    else {
        fs.writeFileSync(path.join(dataDir, 'attendance.json'), JSON.stringify(attendance, null, 2));
        console.log(`Saved ${attendance.length} attendance records.`);
    }

    console.log("Downloading payments...");
    const { data: payments, error: err3 } = await supabase.from('payments').select('*');
    if (err3) console.error("Payments error:", err3.message);
    else {
        fs.writeFileSync(path.join(dataDir, 'payments.json'), JSON.stringify(payments, null, 2));
        console.log(`Saved ${payments.length} payment records.`);
    }

    console.log("Download complete.");
}
sync();
