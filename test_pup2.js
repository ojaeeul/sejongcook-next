const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting Puppeteer...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Capture console output from the page
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

    // Expose a function to mock fetch so we have data
    await page.evaluateOnNewDocument(() => {
        window.fetch = async (url) => {
            let data = [];
            if (url.includes('members')) {
                data = [{ id: "1", course: "제과제빵기능사(통합)", name: "Test" }];
            } else if (url.includes('attendance')) {
                data = [
                    { memberId: "1", date: "2026-05-10T00:00:00.000Z", status: "present", course: "제과제빵기능사(통합)" }
                ];
            } else if (url.includes('settings')) {
                data = { GLOBAL_DATA_ADJUSTMENTS: {} };
            }
            return { ok: true, json: async () => data };
        };
    });

    console.log("Navigating to sheet.html...");
    await page.goto('http://localhost:8000/sheet.html', { waitUntil: 'networkidle0' });
    
    // Wait a bit for JS to run
    await new Promise(r => setTimeout(r, 1000));
    
    // Check localStorage
    const ls = await page.evaluate(() => JSON.parse(localStorage.getItem('sejong_ledger_sync') || '{}'));
    console.log("sejong_ledger_sync keys:", Object.keys(ls).length);
    if(Object.keys(ls).length > 0) {
        const firstKey = Object.keys(ls)[0];
        console.log("Sample sync key:", firstKey, "=>", ls[firstKey]);
    }

    console.log("Navigating to tuition.html...");
    await page.goto('http://localhost:8000/tuition.html', { waitUntil: 'networkidle0' });
    
    // Wait a bit
    await new Promise(r => setTimeout(r, 1000));
    
    // Get the HTML of the tuition table to see what rendered
    const tableHTML = await page.evaluate(() => {
        const t = document.querySelector('.ledger-table');
        return t ? t.outerHTML : 'No table found';
    });
    console.log("Tuition Table length:", tableHTML.length);
    
    await browser.close();
    console.log("Done.");
})();
