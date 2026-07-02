const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

const DATA_DIR = path.join(process.cwd(), 'Sejong', 'SejongAttendance', 'public', 'data');

async function restoreData() {
  console.log("Starting Supabase Restore...");

  // 1. Members
  const membersPath = path.join(DATA_DIR, 'members.json');
  if (fs.existsSync(membersPath)) {
    const members = JSON.parse(fs.readFileSync(membersPath, 'utf-8')).filter(m => m.id);
    console.log(`Wiping and restoring ${members.length} members...`);
    await supabase.from('members').delete().neq('id', '0');
    for (let i = 0; i < members.length; i += 500) {
      const batch = members.slice(i, i + 500);
      const { error } = await supabase.from('members').insert(batch);
      if (error) console.error("Members error:", error.message);
    }
  }

  // 2. Attendance
  const attPath = path.join(DATA_DIR, 'attendance.json');
  if (fs.existsSync(attPath)) {
    let att = JSON.parse(fs.readFileSync(attPath, 'utf-8'));
    att = att.map(({ id, ...rest }) => rest);
    console.log(`Wiping and restoring ${att.length} attendance records...`);
    await supabase.from('attendance').delete().neq('date', '1900-01-01');
    for (let i = 0; i < att.length; i += 500) {
      const batch = att.slice(i, i + 500);
      const { error } = await supabase.from('attendance').insert(batch);
      if (error) console.error("Attendance error:", error.message);
    }
  }

  // 3. Payments
  const payPath = path.join(DATA_DIR, 'payments.json');
  if (fs.existsSync(payPath)) {
    let payments = JSON.parse(fs.readFileSync(payPath, 'utf-8'));
    payments = payments.map(({ id, ...rest }) => rest);
    console.log(`Wiping and restoring ${payments.length} payment records...`);
    await supabase.from('payments').delete().neq('amount', -1);
    for (let i = 0; i < payments.length; i += 500) {
      const batch = payments.slice(i, i + 500);
      const { error } = await supabase.from('payments').insert(batch);
      if (error) console.error("Payments error:", error.message);
    }
  }

  console.log("Restore Complete!");
}

restoreData();
