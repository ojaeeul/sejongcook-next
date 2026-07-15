const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/sejong/exam_admin.html', { waitUntil: 'domcontentloaded' });
  
  // Wait 3 seconds for data fetch and render
  await new Promise(r => setTimeout(r, 3000));
  
  const calendarHTML = await page.evaluate(() => {
      const el = document.getElementById('calendarGrid');
      return el ? el.innerHTML : 'NOT FOUND';
  });
  
  console.log("CALENDAR HTML LENGTH:", calendarHTML.length);
  if (calendarHTML.includes("1명 응시")) {
      console.log("SUCCESS: '1명 응시' FOUND IN DOM!");
  } else {
      console.log("FAILURE: '1명 응시' NOT FOUND IN DOM!");
  }
  
  await browser.close();
  process.exit(0);
})();
