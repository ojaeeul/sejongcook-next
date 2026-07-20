const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('Sejong/SejongAttendance/public/expense.html', 'utf8');
const scriptContent = fs.readFileSync('Sejong/SejongAttendance/public/expense_logic.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "outside-only" });
const window = dom.window;
const document = window.document;

window.BroadcastChannel = class { constructor() {} postMessage() {} };
window.BAKING_COURSES = ['제과기능사', '제빵기능사', '제과제빵기능사', '원데이', '게익원데이', '케익원데이', '케익디자이너'];
window.COOKING_COURSES = ['한식기능사'];
window.paymentsData = [];
window.membersData = [];

for (let i=0; i<1000; i++) {
    window.paymentsData.push({
        memberId: i,
        year: 2026,
        month: 7,
        amount: 300000,
        status: 'paid',
        updatedAt: new Date(Date.now() + Math.floor(i/10)*86400000).toISOString(),
        course: (i % 2 === 0) ? '한식기능사' : '제과기능사'
    });
    window.membersData.push({
        id: i,
        name: `학생${i}`,
        course: (i % 2 === 0) ? '한식기능사' : '제과기능사'
    });
}

// Inject logic
window.eval(scriptContent);

console.time('processNewPayments (1000 new items)');
window.processNewPayments();
console.timeEnd('processNewPayments (1000 new items)');

console.time('processNewPayments (1000 existing items)');
window.processNewPayments();
console.timeEnd('processNewPayments (1000 existing items)');

