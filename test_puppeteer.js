const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/sejong/exam_admin.html', { waitUntil: 'networkidle2' });
  
  // Wait a bit for JS to render
  await new Promise(r => setTimeout(r, 2000));
  
  await page.screenshot({ path: 'exam_admin_test.png' });
  await browser.close();
  console.log("Screenshot saved to exam_admin_test.png");
})();
