const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    await page.goto('http://localhost:3000/sejong/stats.html', { waitUntil: 'networkidle0' });
    
    // wait for 2 seconds just in case of delayed fetch
    await new Promise(r => setTimeout(r, 2000));
    
    const expenseText = await page.$eval('#dashExpense', el => el.innerText).catch(() => 'NOT FOUND');
    const accText = await page.$eval('#dashExpenseAcc', el => el.innerText).catch(() => 'NOT FOUND');
    
    console.log(`dashExpense: ${expenseText}`);
    console.log(`dashExpenseAcc: ${accText}`);
    
    await browser.close();
})();
