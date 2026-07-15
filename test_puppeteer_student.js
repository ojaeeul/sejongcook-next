const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/sejong/student/exam.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  await page.evaluate(() => {
      inputPin(9);
      inputPin(0);
      inputPin(7);
      inputPin(3);
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
      selectCourse('제과기능사');
      showScreen('exam');
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'student_exam_list_test_dual.png' });

  await browser.close();
  process.exit(0);
})();
