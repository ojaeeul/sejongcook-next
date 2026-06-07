const puppeteer = require('puppeteer');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
    try {
        console.log("Starting browser...");
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();
        
        page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
        
        console.log("Navigating to http://localhost:3000/sejong/sms.html ...");
        await page.goto('http://localhost:3000/sejong/sms.html', { waitUntil: 'domcontentloaded' });
        
        await sleep(2000); // wait for data to fetch
        console.log("Page loaded. Expanding calendar...");
        
        const calendarOpened = await page.evaluate(() => {
            const toggleBtn = document.getElementById('rangeToggleIcon');
            if (toggleBtn) {
                toggleBtn.parentElement.click();
                return true;
            }
            return false;
        });
        
        if (!calendarOpened) {
            console.log("Calendar toggle button NOT FOUND!");
        }
        
        await sleep(1500); // wait for calendar to render
        
        console.log("Simulating drag...");
        await page.evaluate(() => {
            const days = document.querySelectorAll('.calendar-day:not(.other-month)');
            if (days.length > 5) {
                const startDay = days[10]; // 11th of month
                const endDay = days[12]; // 13th of month
                
                const startEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
                startDay.dispatchEvent(startEvent);
                
                const moveEvent = new MouseEvent('mouseenter', { bubbles: true, cancelable: true });
                endDay.dispatchEvent(moveEvent);
                
                const endEvent = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
                endDay.dispatchEvent(endEvent);
                
                const globalEndEvent = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
                window.dispatchEvent(globalEndEvent);
                console.log("Drag events dispatched.");
            } else {
                console.log("Not enough calendar days found! Count:", days.length);
            }
        });
        
        await sleep(1000);
        
        const modalText = await page.evaluate(() => {
            const modal = document.getElementById('modalContent');
            return modal ? modal.innerHTML : 'No modal content found';
        });
        
        console.log("MODAL TEXT:", modalText);
        
        await page.screenshot({ path: 'calendar_final_debug.png' });
        await browser.close();
        console.log("Test finished.");
    } catch (e) {
        console.error("Puppeteer Error:", e);
    }
})();
