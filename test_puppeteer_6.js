const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.setCookie({
    name: 'admin_auth',
    value: 'true',
    domain: 'localhost',
    path: '/'
  });
  
  await page.goto('http://localhost:3000/sejong/exam_admin.html', { waitUntil: 'networkidle2' });
  
  await new Promise(r => setTimeout(r, 2000));
  
  const calendarHTML = await page.evaluate(() => {
      const el = document.getElementById('calendarGrid');
      return el ? el.innerHTML : 'NOT FOUND';
  });
  
  console.log(calendarHTML);
  
  await browser.close();
  process.exit(0);
})();
