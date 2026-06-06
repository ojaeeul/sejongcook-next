const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting Puppeteer...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Capture console output from the page
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    console.log("Navigating to sheet.html...");
    await page.goto('http://localhost:8000/sheet.html', { waitUntil: 'networkidle0' });
    
    // Check localStorage
    const ls = await page.evaluate(() => JSON.parse(localStorage.getItem('sejong_ledger_sync') || '{}'));
    console.log("sejong_ledger_sync keys:", Object.keys(ls).length);
    if(Object.keys(ls).length > 0) {
        const firstKey = Object.keys(ls)[0];
        console.log("Sample sync key:", firstKey, "=>", ls[firstKey]);
    }

    console.log("Navigating to tuition.html...");
    await page.goto('http://localhost:8000/tuition.html', { waitUntil: 'networkidle0' });
    
    // Get the HTML of the tuition table to see what rendered
    const tableHTML = await page.evaluate(() => {
        const t = document.querySelector('.ledger-table');
        return t ? t.outerHTML : 'No table found';
    });
    console.log("Tuition Table length:", tableHTML.length);
    
    await browser.close();
    console.log("Done.");
})();
