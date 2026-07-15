const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setCookie({ name: 'admin_auth', value: 'true', domain: 'localhost', path: '/' });
  
  page.on('response', async res => {
      if (res.url().includes('/api/sejong/exams')) {
          console.log("EXAMS API STATUS:", res.status());
          try {
              const text = await res.text();
              console.log("EXAMS API RESPONSE:", text.substring(0, 100));
          } catch(e) {}
      }
  });

  await page.goto('http://localhost:3000/sejong/exam_admin.html', { waitUntil: 'networkidle2' });
  await browser.close();
  process.exit(0);
})();
