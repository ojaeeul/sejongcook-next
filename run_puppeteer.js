const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
        
        await page.goto('http://localhost:3000/sejong/sms.html', { waitUntil: 'domcontentloaded' });
        
        await page.waitForTimeout(2000);
        console.log("Page loaded. Expanding calendar...");
        await page.evaluate(() => {
            const toggleBtn = document.getElementById('rangeToggleIcon');
            if (toggleBtn) {
                toggleBtn.parentElement.click();
            } else {
                console.log("Toggle button not found");
            }
        });
        
        await page.waitForTimeout(2000);
        await browser.close();
        console.log("Test finished.");
    } catch (e) {
        console.error("Puppeteer Error:", e);
    }
})();
