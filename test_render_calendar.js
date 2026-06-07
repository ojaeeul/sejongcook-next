const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/sejong/sms.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

const sharedCalcCode = fs.readFileSync('public/sejong/shared_calc.js', 'utf8');
const smsCode = fs.readFileSync('public/sejong/sms_v3.js', 'utf8');

dom.window.eval(sharedCalcCode);
dom.window.eval(smsCode);

// Mock globals
dom.window.allMembers = [
    { id: 1, name: 'Test User', course: '제과기능사', start_date: '2025-12-01' }
];
dom.window.holidaysData = [];
dom.window.attendanceData = [
    { memberId: 1, course: '제과기능사', date: '2026-01-02', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-01-04', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-01-09', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-01-11', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-01-16', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-01-18', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-01-23', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-01-25', status: 'present' },
    { memberId: 1, course: '제과기능사', date: '2026-01-30', status: 'present' }
];
dom.window.paymentsData = [];
dom.window.GLOBAL_DATA_ADJUSTMENTS = {};
dom.window.calendarYear = 2026;
dom.window.calendarMonth = 0; // January

setTimeout(() => {
    try {
        console.log("Calling renderRangeCalendar...");
        dom.window.renderRangeCalendar();
        
        const days = Array.from(dom.window.document.querySelectorAll('#calendarDays .calendar-day'));
        let redDays = [];
        days.forEach(d => {
            if(d.style.color === 'rgb(239, 68, 68)' || d.style.color === '#ef4444' || d.style.borderBottom) {
                redDays.push(d.textContent);
            }
        });
        console.log("Red days found:", redDays);
    } catch(e) {
        console.log("CAUGHT ERROR:", e.message, e.stack);
    }
}, 1000);
