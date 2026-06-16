const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    await page.goto('http://localhost:3000/sejong/stats.html', { waitUntil: 'domcontentloaded' });
    
    // Wait for the data to be fetched and globalExpenses to be populated
    await page.waitForFunction('window.globalExpenses !== undefined && window.globalExpenses.length > 0', { timeout: 10000 }).catch(() => console.log('Timeout waiting for globalExpenses'));
    
    const expenses = await page.evaluate(() => window.globalExpenses);
    console.log('globalExpenses:', expenses);
    
    const todayExp = await page.$eval('#dashExpense', el => el.innerText).catch(() => 'NOT FOUND');
    const accExp = await page.$eval('#dashExpenseAcc', el => el.innerText).catch(() => 'NOT FOUND');
    
    console.log(`dashExpense: ${todayExp}`);
    console.log(`dashExpenseAcc: ${accExp}`);
    
    await browser.close();
})();
