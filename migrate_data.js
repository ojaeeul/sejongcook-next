require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_DIR = path.join(__dirname, 'Sejong/SejongAttendance/data');

async function migrate() {
    console.log("Starting migration...");

    // 1. Members
    if (fs.existsSync(path.join(DATA_DIR, 'members.json'))) {
        const members = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'members.json'), 'utf-8'));
        if (members.length > 0) {
            console.log(`Migrating ${members.length} members...`);
            const { error } = await supabase.from('members').upsert(members);
            if (error) console.error("Members error:", error);
            else console.log("Members migrated.");
        }
    }

    // 2. Attendance
    if (fs.existsSync(path.join(DATA_DIR, 'attendance.json'))) {
        const attendance = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'attendance.json'), 'utf-8'));
        if (attendance.length > 0) {
            console.log(`Migrating ${attendance.length} attendance records...`);
            const { error } = await supabase.from('attendance').upsert(attendance);
            if (error) console.error("Attendance error:", error);
            else console.log("Attendance migrated.");
        }
    }

    // 3. Payments
    if (fs.existsSync(path.join(DATA_DIR, 'payments.json'))) {
        const payments = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'payments.json'), 'utf-8'));
        if (payments.length > 0) {
            console.log(`Migrating ${payments.length} payments...`);
            const { error } = await supabase.from('payments').upsert(payments);
            if (error) console.error("Payments error:", error);
            else console.log("Payments migrated.");
        }
    }

    // 4. Holidays
    if (fs.existsSync(path.join(DATA_DIR, 'holidays.json'))) {
        const holidays = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'holidays.json'), 'utf-8'));
        if (holidays.length > 0) {
            console.log(`Migrating ${holidays.length} holidays...`);
            const { error } = await supabase.from('settings').upsert({ key: 'holidays', value: holidays }, { onConflict: 'key' });
            if (error) console.error("Holidays error:", error);
            else console.log("Holidays migrated.");
        }
    }

    // 5. Settings
    if (fs.existsSync(path.join(DATA_DIR, 'settings.json'))) {
        const settings = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'settings.json'), 'utf-8'));
        console.log(`Migrating settings...`);
        const { error } = await supabase.from('settings').upsert({ key: 'settings', value: settings }, { onConflict: 'key' });
        if (error) console.error("Settings error:", error);
        else console.log("Settings migrated.");
    }

    // 6. Timetable
    if (fs.existsSync(path.join(DATA_DIR, 'timetable_data.json'))) {
        const timetable = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'timetable_data.json'), 'utf-8'));
        console.log(`Migrating timetable...`);
        const { error } = await supabase.from('settings').upsert({ key: 'timetable', value: timetable }, { onConflict: 'key' });
        if (error) console.error("Timetable error:", error);
        else console.log("Timetable migrated.");
    }

    console.log("Migration complete!");
}

migrate();
