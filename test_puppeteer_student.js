const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/sejong/student/exam.html', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2000));
  
  // Test authentication for '오재을6' whose phone ends with '9073' and course is '제과제빵기능사(10:00)'
  await page.evaluate(() => {
      inputPin(9);
      inputPin(0);
      inputPin(7);
      inputPin(3);
  });
  
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'student_course_test.png' });

  // Test selecting '제과기능사'
  await page.evaluate(() => {
      selectCourse('제과기능사');
      showScreen('exam');
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'student_exam_list_test.png' });

  await browser.close();
  process.exit(0);
})();
