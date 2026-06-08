require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function test() {
  const { data, error } = await supabase.from('sms_history').select('*').limit(1);
  console.log("sms_history:", error ? error.message : "Exists");
  const { data: d2, error: e2 } = await supabase.from('settings').select('*').limit(1);
  console.log("settings:", e2 ? e2.message : "Exists", d2);
}
test();
