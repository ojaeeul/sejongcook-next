const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.setCookie({ name: 'admin_auth', value: 'true', domain: 'localhost', path: '/' });
  await page.goto('http://localhost:3000/sejong/exam_admin.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Try to open first analysis
  const result = await page.evaluate(() => {
      if (typeof examsData !== 'undefined' && examsData.length > 0) {
          try {
              openAnalysis(0);
              return { success: true, reportVisible: document.getElementById('reportContainer').style.display };
          } catch(e) {
              return { success: false, error: e.toString() };
          }
      }
      return { success: false, error: 'No examsData' };
  });
  
  console.log(result);
  await page.screenshot({ path: 'exam_admin_open_test.png' });
  await browser.close();
  process.exit(0);
})();
