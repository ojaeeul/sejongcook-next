require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('notice').select('*').limit(1);
  console.log('notice data:', data);
  console.log('notice error:', error);
  const { data: data2, error: error2 } = await supabase.from('job_openings').select('*').limit(1);
  console.log('job_openings data:', data2);
}
run();
