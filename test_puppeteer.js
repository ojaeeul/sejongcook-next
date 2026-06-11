const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('response', response => {
      if (!response.ok()) {
          console.log(`HTTP ${response.status()}: ${response.url()}`);
      }
  });

  await page.goto('http://localhost:3000/sejong/sms.html', {waitUntil: 'networkidle2'});
  
  try {
      await page.evaluate(() => toggleRangeCalendar());
      console.log("toggleRangeCalendar executed successfully");
  } catch(e) {
      console.log("Failed to execute toggleRangeCalendar:", e.message);
  }
  
  await browser.close();
})();
