const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/sejong/stats.html', { waitUntil: 'networkidle2' });
    
    const expenseText = await page.$eval('#dashExpense', el => el.innerText).catch(() => 'NOT FOUND');
    const accText = await page.$eval('#dashExpenseAcc', el => el.innerText).catch(() => 'NOT FOUND');
    
    console.log(`dashExpense: ${expenseText}`);
    console.log(`dashExpenseAcc: ${accText}`);
    
    await browser.close();
})();
