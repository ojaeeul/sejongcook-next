const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/sejong/exam_admin.html', { waitUntil: 'networkidle0' });
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  const calendarHTML = await page.evaluate(() => {
      const el = document.getElementById('calendarGrid');
      return el ? el.innerHTML : 'NOT FOUND';
  });
  
  console.log("CALENDAR HTML LENGTH:", calendarHTML.length);
  if (calendarHTML.includes("1명 응시")) {
      console.log("SUCCESS: '1명 응시' FOUND IN DOM!");
  } else {
      console.log("FAILURE: '1명 응시' NOT FOUND IN DOM!");
      console.log(calendarHTML);
  }
  
  await browser.close();
})();
