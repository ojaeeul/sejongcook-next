const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting Puppeteer...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Go to student exam page
    await page.goto('http://localhost:3000/sejong/student/exam.html', { waitUntil: 'networkidle0' });
    
    console.log("Logging in as Master (7777)...");
    await page.evaluate(() => {
        window.authenticateUser('7777');
    });
    
    // Wait a bit
    await new Promise(r => setTimeout(r, 500));
    
    console.log("Selecting first available exam...");
    const examKey = await page.evaluate(() => {
        const keys = Object.keys(questionsData);
        startExam(keys[0]);
        return keys[0];
    });
    
    console.log("Started exam:", examKey);
    await new Promise(r => setTimeout(r, 500));
    
    console.log("Simulating click and immediate swipe (Race Condition)...");
    
    const result = await page.evaluate(() => {
        return new Promise((resolve) => {
            // Click Option 2
            const optBtns = document.querySelectorAll('.option-btn');
            optBtns[1].click(); // Select Option 2
            
            // Immediately swipe to next question
            nextQuestion();
            
            // Wait to let timeouts settle
            setTimeout(() => {
                resolve({
                    q0: userAnswers[0],
                    q1: userAnswers[1],
                    currentIndex: currentQuestionIndex
                });
            }, 500);
        });
    });
    
    console.log("=== TEST RESULT ===");
    console.log("Question 0 Answer:", result.q0);
    console.log("Question 1 Answer:", result.q1);
    console.log("Current Page Index:", result.currentIndex);
    
    if (result.q0 === 2 && result.q1 === null && result.currentIndex === 1) {
        console.log("✅ TEST PASSED: Race condition is fully resolved. Answer stayed on Question 0.");
    } else {
        console.error("❌ TEST FAILED: Answer leaked to another question or state is corrupted.");
    }
    
    await browser.close();
})();
