require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { JSDOM } = require('jsdom');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('settings').select('value').like('key', 'expense_notebook%');
    let globalExpenses = [];
    
    if (data) {
        data.forEach(d => {
            let val = d.value;
            if (!val) return;
            
            let notebookYear = val.expenseYear || '2026';
            notebookYear = notebookYear.replace(/[^0-9]/g, '');
            
            const dom = new JSDOM(val.leftHTML || '');
            const document = dom.window.document;
            
            let lastSeenDate = '';
            Array.from(document.querySelectorAll('.entry-line')).forEach(line => {
                const dCol = line.querySelector('.date-col');
                const descCol = line.querySelector('.desc-col');
                const aCol = line.querySelector('.amount-col');
                
                if(!descCol || !aCol) return;
                
                let dText = dCol ? dCol.textContent.trim() : '';
                if(dText) lastSeenDate = dText;
                else dText = lastSeenDate;

                let amountText = aCol.textContent.trim();
                let descText = descCol.textContent.trim();
                
                if(!amountText || !descText) return;

                let match = dText.match(/^(\d+)\/(\d+)/);
                if(match) {
                    let rowMonth = parseInt(match[1]);
                    let rowDay = parseInt(match[2]);
                    let rowYear = parseInt(notebookYear);
                    
                    let num = Number(amountText.replace(/,/g, '').replace(/\.—/g, '000').replace(/\.-/g, '000').replace(/[^0-9-]/g, ''));
                    if(isNaN(num)) num = 0;
                    
                    const eDate = new Date(rowYear, rowMonth - 1, rowDay, 12, 0, 0);
                    globalExpenses.push({
                        amount: num,
                        date: eDate.toISOString(),
                        desc: descText
                    });
                }
            });
        });
    }
    
    console.log("Total expenses parsed:", globalExpenses.length);
    
    const today = new Date(); // assume 2026-06-17
    // mock user date
    today.setFullYear(2026);
    today.setMonth(5); // June
    today.setDate(17);
    
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();
    
    let thisMonthExpense = 0;
    let todayExpense = 0;
    
    globalExpenses.forEach(e => {
        const eAmt = parseInt(e.amount) || 0;
        const eDate = new Date(e.date);
        
        if (eDate.getFullYear() === todayYear && eDate.getMonth() === todayMonth) {
            thisMonthExpense += eAmt;
            if (eDate.getDate() === todayDate) {
                todayExpense += eAmt;
            }
        }
    });
    
    console.log("todayExpense:", todayExpense);
    console.log("thisMonthExpense:", thisMonthExpense);
}
check();
