const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting Puppeteer to generate high-res poster...");
    const browser = await puppeteer.launch({ 
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    
    // Set viewport to the popup's base size, but with a huge scale factor for high res (deviceScaleFactor: 6 = 2700x3900)
    // Hide all other popups (IDs 1, 2, 3, 4) by faking localStorage so ONLY ID 5 (주말반) appears
    await page.evaluateOnNewDocument(() => {
        const future = new Date().getTime() + 100000000;
        localStorage.setItem('popup_hidden_1', future.toString());
        localStorage.setItem('popup_hidden_2', future.toString());
        localStorage.setItem('popup_hidden_3', future.toString());
        localStorage.setItem('popup_hidden_4', future.toString());
    });
    
    // Set viewport to a desktop size (1024x1024) to trigger Tailwind's 'sm:' breakpoint
    // This ensures the footer (phone number, address) is not hidden by 'hidden sm:flex'
    await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 4 });

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    // Wait for popup to be visible
    await page.waitForSelector('.popup-container-responsive');

    console.log("Popup found. Modifying DOM to find the correct popup and remove UI elements...");
    const targetPopupIndex = await page.evaluate(() => {
        const popups = Array.from(document.querySelectorAll('.popup-container-responsive'));
        // Find the popup containing "주말" or "토요일"
        const targetIndex = popups.findIndex(p => p.innerText.includes('주말') || p.innerText.includes('토요일'));
        
        if (targetIndex === -1) return 0; // fallback to first
        
        // Hide all other popups to avoid overlapping
        popups.forEach((p, idx) => {
            if (idx !== targetIndex) {
                p.parentElement.style.display = 'none'; // Hide the wrapper
            }
        });
        
        const popup = popups[targetIndex];

        if (!popup) return 0;

        // Hide ONLY the "하루 안보기" checkbox and "닫기" button
        const labels = popup.querySelectorAll('label');
        labels.forEach(l => {
            if(l.innerText.includes('하루')) l.style.display = 'none';
        });

        const buttons = popup.querySelectorAll('button');
        buttons.forEach(b => {
            if(b.innerText.includes('닫기')) b.style.display = 'none';
        });

        // Remove rounded corners and borders for clean poster edge
        popup.style.borderRadius = '0';
        popup.style.border = 'none';
        popup.style.boxShadow = 'none';

        return targetIndex;
    });

    // Wait a brief moment for layout recalculation
    await new Promise(r => setTimeout(r, 500));

    // Take a screenshot of the popup element itself
    const popupElements = await page.$$('.popup-container-responsive');
    const popupElement = popupElements[targetPopupIndex];

    
    const outputPath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/poster_high_res.png';
    await popupElement.screenshot({ path: outputPath });

    console.log(`High-res poster generated successfully at: ${outputPath}`);
    await browser.close();
})();
