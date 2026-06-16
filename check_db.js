require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('settings').select('key, value').like('key', 'expense_notebook%');
    if (data) {
        data.forEach(d => {
            console.log("KEY:", d.key);
            console.log("Year in value:", d.value.expenseYear);
            if (d.value.leftHTML.includes("17(수)")) {
                console.log("==> CONTAINS 17(수)");
            }
        });
    } else {
        console.log("Error:", error);
    }
}
check();
