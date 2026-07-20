const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/admin/inquiry', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'admin_inquiry_desktop.png' });
  
  await page.setViewport({ width: 375, height: 812 });
  await page.goto('http://localhost:3000/admin/inquiry', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'admin_inquiry_mobile_closed.png' });
  
  await page.click('button');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'admin_inquiry_mobile_open.png' });
  
  await browser.close();
})();
