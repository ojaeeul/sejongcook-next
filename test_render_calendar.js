const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('public/sejong/sms.html', 'utf8');
const dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });

// Mock globals
dom.window.allMembers = [
    { id: 1, name: 'Test User', course: '제과기능사' }
];
dom.window.holidaysData = [];
dom.window.attendanceData = [];
dom.window.paymentsData = [];
dom.window.GLOBAL_DATA_ADJUSTMENTS = {};

dom.window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.log('ERROR:', msg, lineNo, columnNo);
};

setTimeout(() => {
    try {
        console.log("Calling renderRangeCalendar...");
        dom.window.renderRangeCalendar();
        console.log("Done. calendarDays child count:", dom.window.document.getElementById('calendarDays').children.length);
    } catch(e) {
        console.log("CAUGHT ERROR:", e.message, e.stack);
    }
}, 2000);
