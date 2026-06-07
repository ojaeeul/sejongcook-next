const { JSDOM } = require("jsdom");
const fs = require('fs');

const htmlContent = fs.readFileSync("/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sms.html", 'utf8');
const dom = new JSDOM(htmlContent, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;
global.window = window;
global.document = document;

// Need to mock fetch and localstorage
window.fetch = async () => ({
    ok: true,
    json: async () => []
});
window.localStorage = {
    getItem: () => null,
    setItem: () => {}
};

// Load shared_calc.js
const calcContent = fs.readFileSync("/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js", 'utf8');
const script1 = document.createElement("script");
script1.textContent = calcContent;
document.body.appendChild(script1);

// Load sms_v3.js
const smsContent = fs.readFileSync("/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sms_v3.js", 'utf8');
const script2 = document.createElement("script");
script2.textContent = smsContent;
document.body.appendChild(script2);

setTimeout(() => {
    try {
        console.log("Mocking allMembers...");
        window.allMembers = [
            { id: 1, name: "홍길동", course: "제과기능사", status: "active", phone: "010-1111-2222" },
            { id: 2, name: "김철수", course: "제빵기능사", status: "active", phone: "010-3333-4444" }
        ];
        window.calendarYear = 2026;
        window.calendarMonth = 5;
        
        window.getMemberAllMilestones = function(id, course, y, m) {
            if (id === 1) return [{ year: 2026, month: 6, day: 15 }];
            if (id === 2) return [{ year: 2026, month: 6, day: 15 }, { year: 2026, month: 6, day: 17 }];
            return [];
        };
        
        console.log("Running renderRangeCalendar...");
        window.renderRangeCalendar();
        
        console.log("Simulating drag on day 15...");
        const days = document.querySelectorAll('.calendar-day:not(.other-month)');
        if (days.length > 15) {
            days[14].onmousedown(new window.MouseEvent('mousedown'));
            days[16].onmouseenter(new window.MouseEvent('mouseenter'));
            days[16].onmouseup(new window.MouseEvent('mouseup'));
            
            console.log("Modal display after drag:");
            console.log(document.getElementById('modalContent').innerHTML);
        } else {
            console.log("Not enough calendar days found!");
        }
    } catch(err) {
        console.error("Runtime error:", err);
    }
}, 1000);
