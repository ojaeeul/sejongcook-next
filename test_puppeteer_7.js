const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setCookie({ name: 'admin_auth', value: 'true', domain: 'localhost', path: '/' });
  await page.goto('http://localhost:3000/sejong/exam_admin.html', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  const debugInfo = await page.evaluate(() => {
      return {
          examsDataLength: typeof examsData !== 'undefined' ? examsData.length : -1,
          recordsByDayKeys: typeof recordsByDay !== 'undefined' ? Object.keys(recordsByDay) : 'NOT FOUND',
          firstExam: typeof examsData !== 'undefined' && examsData.length > 0 ? examsData[0] : null
      };
  });
  console.log(JSON.stringify(debugInfo, null, 2));
  await browser.close();
  process.exit(0);
})();
