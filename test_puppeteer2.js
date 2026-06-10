const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE ERROR:', msg.text());
        }
    });
    
    page.on('pageerror', err => {
        console.log('PAGE EXCEPTION:', err.toString());
    });

    try {
        await page.goto('file://' + __dirname + '/Sejong/SejongAttendance/public/tuition.html');
        await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
        console.log("Error loading page", e);
    }

    await browser.close();
})();
