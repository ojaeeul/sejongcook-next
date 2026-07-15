const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.setCookie({ name: 'admin_auth', value: 'true', domain: 'localhost', path: '/' });
  await page.goto('http://localhost:3000/sejong/exam_admin.html', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const isLoaded = await page.evaluate(() => {
      const grid = document.getElementById('calendarGrid');
      return {
          examsDataLength: typeof examsData !== 'undefined' ? examsData.length : -1,
          calendarText: grid ? grid.innerText : 'NO GRID'
      };
  });
  console.log("Exams Data Length:", isLoaded.examsDataLength);
  if (isLoaded.calendarText.includes('1명 응시')) {
      console.log("SUCCESS: '1명 응시' FOUND!");
  } else {
      console.log("FAILURE: Not found.");
  }
  
  await page.screenshot({ path: 'exam_admin_test_finally.png' });
  await browser.close();
  process.exit(0);
})();
