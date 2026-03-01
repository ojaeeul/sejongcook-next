const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new"
  });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[DEBUG]')) {
        console.log(text);
    }
  });

  await page.goto('http://localhost:8000/sheet.html', { waitUntil: 'networkidle0' });
  
  await browser.close();
})();
