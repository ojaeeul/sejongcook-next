const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/sejong/exam_admin.html', { waitUntil: 'networkidle2' });
  
  // Wait a bit for JS to render
  await new Promise(r => setTimeout(r, 2000));
  
  // Click on July 10 (the 2nd friday of the month)
  // Let's just find the div containing "1명 응시" and click it
  await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div'));
    const target = divs.find(d => d.textContent.includes('1명 응시'));
    if (target) {
        // Need to click the parent cell
        target.parentElement.click();
    }
  });

  await new Promise(r => setTimeout(r, 1000));
  
  await page.screenshot({ path: 'exam_admin_test2.png' });
  await browser.close();
  console.log("Screenshot saved to exam_admin_test2.png");
})();
