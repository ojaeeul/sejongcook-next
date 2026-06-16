const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    
    // override updateDashboard or mock globalExpenses to see what's going on
    await page.goto('http://localhost:3000/sejong/stats.html');
    
    // Wait a bit for fetches to complete
    await new Promise(r => setTimeout(r, 5000));
    
    // Evaluate in page context
    const expenseData = await page.evaluate(() => {
        return {
            todayExpense: typeof todayExpense !== 'undefined' ? todayExpense : null,
            thisMonthExpense: typeof thisMonthExpense !== 'undefined' ? thisMonthExpense : null,
            globalExpensesCount: window.globalExpenses ? window.globalExpenses.length : 0,
            globalExpenses: window.globalExpenses,
            dashText: document.getElementById('dashExpense') ? document.getElementById('dashExpense').innerText : 'No Element'
        };
    });
    
    console.log(JSON.stringify(expenseData, null, 2));
    await browser.close();
})();
