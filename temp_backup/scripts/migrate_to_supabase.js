const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_DIR = path.join(process.cwd(), 'data', 'sejong');

async function migrateData() {
  console.log("Starting Migration...");

  // 1. Members
  try {
    const membersPath = path.join(DATA_DIR, 'members.json');
    if (fs.existsSync(membersPath)) {
      let members = JSON.parse(fs.readFileSync(membersPath, 'utf-8'));
      console.log(`Migrating ${members.length} members...`);
      // Exclude empty ids if any, or non-objects
      members = members.filter(m => m.id);

      const { data, error } = await supabase.from('members').upsert(members);
      if (error) throw error;
      console.log("✅ Members migrated");
    }
  } catch (err) {
    console.error("Failed to migrate members:", err.message);
  }

  // 2. Attendance
  try {
    const attPath = path.join(DATA_DIR, 'attendance.json');
    if (fs.existsSync(attPath)) {
      let att = JSON.parse(fs.readFileSync(attPath, 'utf-8'));
      // Remove ID if it's there, let Postgres handle SERIAL
      att = att.map(({ id, ...rest }) => rest);
      console.log(`Migrating ${att.length} attendance records...`);
      // Batch insert 500 at a time
      for (let i = 0; i < att.length; i += 500) {
        const batch = att.slice(i, i + 500);
        const { error } = await supabase.from('attendance').insert(batch);
        if (error) throw error;
      }
      console.log("✅ Attendance migrated");
    }
  } catch (err) {
    console.error("Failed to migrate attendance:", err.message);
  }

  // 3. Payments
  try {
    const payPath = path.join(DATA_DIR, 'payments.json');
    if (fs.existsSync(payPath)) {
      let payments = JSON.parse(fs.readFileSync(payPath, 'utf-8'));
      payments = payments.map(({ id, ...rest }) => rest);
      console.log(`Migrating ${payments.length} payment records...`);
      for (let i = 0; i < payments.length; i += 500) {
        const batch = payments.slice(i, i + 500);
        const { error } = await supabase.from('payments').insert(batch);
        if (error) throw error;
      }
      console.log("✅ Payments migrated");
    }
  } catch (err) {
    console.error("Failed to migrate payments:", err.message);
  }

  // 4. Settings
  try {
    const setPath = path.join(DATA_DIR, 'settings.json');
    if (fs.existsSync(setPath)) {
      const settings = JSON.parse(fs.readFileSync(setPath, 'utf-8'));
      console.log(`Migrating settings...`);
      const payload = { key: 'global', value: settings };
      const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'key' });
      if (error) throw error;
      console.log("✅ Settings migrated");
    }
  } catch (err) {
    console.error("Failed to migrate settings:", err.message);
  }

  console.log("Migration Complete.");
}

migrateData();
