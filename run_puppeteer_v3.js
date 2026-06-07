const puppeteer = require('puppeteer');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    try {
        console.log("Starting browser...");
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

        console.log("Navigating to index.html to set localStorage auth bypass...");
        await page.goto('http://localhost:3000/sejong/index.html');
        await page.evaluate(() => {
            localStorage.setItem('sejong_auth_token', 'valid');
            localStorage.setItem('sejong_auth_time', Date.now().toString());
        });

        console.log("Navigating to sms.html...");
        await page.goto('http://localhost:3000/sejong/sms.html', { waitUntil: 'networkidle2' });
        
        console.log("Waiting for data to load...");
        await sleep(3000);

        console.log("Simulating calendar drag...");
        await page.evaluate(() => {
            const today = new Date();
            const dateStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
            document.getElementById('paymentRangeStart').value = dateStr;
            document.getElementById('paymentRangeEnd').value = dateStr;
            document.getElementById('usePaymentFilter').checked = true;
            selectFilteredCourses();
        });

        console.log("Checking if popup exists...");
        const popupText = await page.evaluate(() => {
            const modal = document.getElementById('customAlertModal');
            if (modal && modal.style.display !== 'none') {
                return modal.innerText;
            }
            return null;
        });

        console.log("Popup Text:", popupText);

        await browser.close();
        console.log("Done.");
    } catch (err) {
        console.error("Puppeteer Script Error:", err);
    }
})();
