const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
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
  
  await page.evaluate(() => {
      inputPin(9);
      inputPin(9);
      inputPin(9);
      inputPin(9);
  });
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Choose exact "을"
  await page.evaluate(() => {
      const items = document.querySelectorAll('.member-list-item');
      for (let item of items) {
          if (item.querySelector('h3') && item.querySelector('h3').textContent.trim() === '을') {
              item.click();
              break;
          }
      }
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'student_course_test_dual.png' });

  // Test selecting '제과기능사'
  await page.evaluate(() => {
      const courses = document.querySelectorAll('.course-card');
      for (let c of courses) {
          if (c.textContent.includes('제과기능사')) {
              c.click();
              break;
          }
      }
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'student_exam_list_test_dual.png' });

  await browser.close();
  process.exit(0);
})();
