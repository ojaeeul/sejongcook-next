const fs = require('fs');
let code = fs.readFileSync('public/tuition_v3.js', 'utf8');

// Mock DOM
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const dom = new JSDOM(`
  <table class="tuition-table">
    <tbody id="tuition-tbody"></tbody>
  </table>
  <div class="table-card"></div>
`);
global.document = dom.window.document;
global.window = dom.window;

// Mock Data
global.membersData = [{
    id: 1, name: 'Test', course: '제과제빵기능사'
}];
global.paymentsData = [];
global.attendancesData = [];
global.courseFees = {};
global.DEFAULT_PRICE = 0;

global.window.currentState = {
    year: 2026,
    month: 3,
    course: 'all',
    tab: 'enrolled',
    viewMode: 'total'
};

// Evaluate the script
eval(code);

// Override API
global.getMemberEighthDayInMonth = function() {
    return {
        currentCount: { count: 10, target: 17 },
        scheduledDate: { year: 2026, month: 3, day: 15 },
        isDueInSelectedMonth: true,
        allMilestones: [
            { year: 2026, month: 1, day: 10, isReal: true },
            { year: 2026, month: 2, day: 12, isReal: true }
        ]
    };
};

try {
    renderTable();
    console.log("Success! Body HTML:");
    console.log(document.getElementById('tuition-tbody').innerHTML.substring(0, 500));
} catch (e) {
    console.log("ERROR:", e.message, e.stack);
}
