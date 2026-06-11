const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    console.log("Navigating to http://localhost:3000/sejong/sheet.html ...");
    await page.goto('http://localhost:3000/sejong/sheet.html', { waitUntil: 'networkidle0', timeout: 45000 });
    
    await page.waitForFunction(() => {
        const panel = document.getElementById('monthlyRedBoxPanel');
        return panel && panel.innerText.includes('1월');
    }, { timeout: 20000 });

    const text = await page.evaluate(() => {
        const panel = document.getElementById('monthlyRedBoxPanel');
        return panel ? panel.innerText : 'Panel not found';
    });

    console.log("=== Badge Contents ===");
    console.log(text);
    
    const match = text.match(/1월\s*\(?(\d+)\)?/);
    if (match) {
        console.log("January Count:", match[1]);
    } else {
        console.log("January Count: 0 (No badge bubble found)");
    }

  } catch(e) {
    console.log('ERROR:', e.message);
  }
  
  await browser.close();
})();
