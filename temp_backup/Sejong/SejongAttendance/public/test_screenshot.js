const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    // Just wait until it answers, don't wait for networkidle
    await page.goto('http://localhost:8000/sheet.html', { waitUntil: 'domcontentloaded', timeout: 5000 });
    await new Promise(r => setTimeout(r, 2000)); // wait 2s for render
    await page.screenshot({ path: '/Users/ojaeeul/.gemini/antigravity/brain/6e6f9e87-5057-41b7-9fb5-fb13935ae977/cutoff_fixed2.png' });
    console.log('SCREENSHOT_SAVED');
  } catch(e) {
    console.log('ERR:', e.message);
  }
  
  await browser.close();
})();
