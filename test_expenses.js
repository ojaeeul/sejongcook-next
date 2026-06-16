const fs = require('fs');

async function test() {
    const res = await fetch('http://localhost:3000/api/sejong/expense?year=all&t=' + Date.now());
    const dataArray = await res.json();
    const notebooks = Array.isArray(dataArray) ? dataArray : [dataArray];
    
    let expenses = [];
    notebooks.forEach(data => {
        if (!data) return;
        let notebookYear = data.expenseYear || '2026';
        notebookYear = notebookYear.replace(/[^0-9]/g, '');

        let matchCount = 0;
        let leftHTML = data.leftHTML || '';
        
        // Simple regex to simulate the DOM parsing since we don't have DOM in Node
        const rowRegex = /<div class="entry-line[^>]*>([\s\S]*?)<\/div>(?=\s*<div class="entry-line|$)/g;
        let m;
        while ((m = rowRegex.exec(leftHTML)) !== null) {
            const inner = m[1];
            const dateMatch = inner.match(/<div class="date-col[^>]*>([^<]*)<\/div>/);
            const descMatch = inner.match(/<div class="desc-col[^>]*>([^<]*)<\/div>/);
            const amtMatch = inner.match(/<div class="amount-col[^>]*>([^<]*)<\/div>/);
            
            if (descMatch && amtMatch) {
                let dText = dateMatch ? dateMatch[1].trim() : '';
                let amountText = amtMatch[1].trim();
                let descText = descMatch[1].trim();
                
                if (amountText && descText) {
                    let dMatch = dText.match(/^(\d+)\/(\d+)/);
                    if (dMatch) {
                        let rowMonth = parseInt(dMatch[1]);
                        let rowDay = parseInt(dMatch[2]);
                        let rowYear = parseInt(notebookYear);
                        let num = Number(amountText.replace(/,/g, '').replace(/\.—/g, '000').replace(/\.-/g, '000').replace(/[^0-9-]/g, ''));
                        if(isNaN(num)) num = 0;
                        expenses.push({ year: rowYear, month: rowMonth, day: rowDay, amt: num, desc: descText });
                    }
                }
            }
        }
    });
    console.log("Found expenses:");
    console.log(expenses);
    
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth();
    const todayDate = now.getDate();
    
    console.log(`Today is ${todayYear}-${todayMonth+1}-${todayDate}`);
    let todayExpense = 0;
    let thisMonthExpense = 0;
    
    expenses.forEach(e => {
        if (e.year === todayYear && e.month === (todayMonth + 1)) {
            thisMonthExpense += e.amt;
            if (e.day === todayDate) {
                todayExpense += e.amt;
            }
        }
    });
    
    console.log(`Calculated todayExpense: ${todayExpense}, thisMonthExpense: ${thisMonthExpense}`);
}

test();
