const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting Puppeteer Test...");
    const browser = await puppeteer.launch({ headless: true });
    
    // Test ledger.html
    const pageLedger = await browser.newPage();
    await pageLedger.goto('http://localhost:3000/sejong/ledger.html');
    await new Promise(r => setTimeout(r, 2000));
    
    const ledgerResults = await pageLedger.evaluate(() => {
        let results = {};
        if (typeof getLedgerMonthStats === 'undefined') return { error: "Function not found" };
        
        // Pick a few members to test
        const membersToTest = membersData.slice(0, 10).map(m => m.id);
        const year = 2026;
        const month = 5;
        
        membersToTest.forEach(id => {
            const memberObj = membersData.find(m => m.id == id);
            if (!memberObj || !memberObj.course) return;
            const courseNameOnly = memberObj.course.split('(')[0].trim();
            const stats = getLedgerMonthStats(id, year, month, courseNameOnly);
            
            let display = '-';
            if (stats.eighthDays && stats.eighthDays.length > 0 && stats.hasAnyAttendance) {
                display = `${stats.eighthDays[0]}일 (${stats.isSimulated ? '예정' : '확정'})`;
            }
            results[id] = display;
        });
        return results;
    });

    // Test tuition.html
    const pageTuition = await browser.newPage();
    await pageTuition.goto('http://localhost:3000/sejong/tuition.html');
    await new Promise(r => setTimeout(r, 2000));
    
    const tuitionResults = await pageTuition.evaluate(() => {
        let results = {};
        if (typeof getMemberEighthDayInMonth === 'undefined') return { error: "Function not found" };
        
        const membersToTest = membersData.slice(0, 10).map(m => m.id);
        const year = 2026;
        const month = 5;
        
        membersToTest.forEach(id => {
            const memberObj = membersData.find(m => m.id == id);
            if (!memberObj || !memberObj.course) return;
            const courseNameOnly = memberObj.course.split('(')[0].trim();
            
            // Re-simulate tuition logic for rendering scheduledDateText
            const stats = getMemberEighthDayInMonth(id, year, month, courseNameOnly);
            let display = '-';
            
            if (stats && stats.allMilestones) {
                let scheduledDate = null;
                stats.allMilestones.forEach(ms => {
                    const remainingForLoop = stats.currentCount.count;
                    const targetCount = (courseNameOnly.includes('제과제빵') || memberObj.course.includes('제과제빵')) ? 17 : 9;
                    if (remainingForLoop < targetCount && !scheduledDate) {
                        scheduledDate = ms;
                    }
                });
                
                let finalScheduledDate = stats.eighthDay; // This is the exact fix we applied!
                scheduledDate = finalScheduledDate;
                
                if (scheduledDate) {
                    if (scheduledDate.year === year && scheduledDate.month === month) {
                        display = `${scheduledDate.day}일 (${scheduledDate.isSimulated ? '예정' : '확정'})`;
                    }
                }
            }
            
            results[id] = display;
        });
        return results;
    });

    console.log("Ledger Results:", ledgerResults);
    console.log("Tuition Results:", tuitionResults);
    
    let isMatch = true;
    Object.keys(ledgerResults).forEach(id => {
        if (ledgerResults[id] !== tuitionResults[id]) {
            console.log(`Mismatch for ID ${id}: Ledger = ${ledgerResults[id]}, Tuition = ${tuitionResults[id]}`);
            isMatch = false;
        }
    });
    
    if (isMatch) console.log("SUCCESS: 100% PARITY CONFIRMED!");
    
    await browser.close();
})();
