const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        const page = await browser.newPage();
        
        await page.goto('http://localhost:3000/sejong/sms.html', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1000);
        
        await page.evaluate(() => {
            const toggleBtn = document.getElementById('rangeToggleIcon');
            if (toggleBtn) {
                toggleBtn.parentElement.click();
            }
        });
        
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'calendar_render_test.png' });
        
        await browser.close();
        console.log("Screenshot saved as calendar_render_test.png");
    } catch (e) {
        console.error("Puppeteer Error:", e);
    }
})();
