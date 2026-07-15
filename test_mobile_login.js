const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Emulate mobile device
  await page.setViewport({ width: 375, height: 667, isMobile: true });
  
  await page.setRequestInterception(true);
  page.on('request', request => {
      if (request.url().includes('/api/sejong/members')) {
          request.respond({
              status: 404,
              contentType: 'application/json',
              body: JSON.stringify({ error: 'not found' })
          });
      } else {
          request.continue();
      }
  });

  await page.goto('http://localhost:3000/sejong/student/exam.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'mobile_0_login.png' });

  await browser.close();
  process.exit(0);
})();
