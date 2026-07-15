const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  
  await page.setCookie({ name: 'admin_auth', value: 'true', domain: 'localhost', path: '/' });
  await page.goto('http://localhost:3000/sejong/exam_admin.html', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const isLoaded = await page.evaluate(() => {
      // Is there any variable set by initCalendar?
      return {
          currentCalDate: typeof currentCalDate !== 'undefined' ? currentCalDate.toString() : 'NO',
          hasGrid: document.getElementById('calendarGrid') ? document.getElementById('calendarGrid').children.length : -1
      };
  });
  console.log(isLoaded);
  await browser.close();
  process.exit(0);
})();
