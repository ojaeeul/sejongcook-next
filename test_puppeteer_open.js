const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setCookie({ name: 'admin_auth', value: 'true', domain: 'localhost', path: '/' });
  await page.goto('http://localhost:3000/sejong/exam_admin.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
      if (typeof examsData !== 'undefined' && examsData.length > 0) {
          openAnalysis(0);
      }
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ path: 'exam_admin_font_test.png' });
  await browser.close();
  process.exit(0);
})();
