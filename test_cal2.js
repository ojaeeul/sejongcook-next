const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

let smsV3Code = fs.readFileSync('../sejongcook_final_deploy/sejong/sms_v3.js', 'utf8');
let sharedCalcCode = fs.readFileSync('../sejongcook_final_deploy/sejong/shared_calc.js', 'utf8');

// Remove global variables that might be redeclared
smsV3Code = smsV3Code.replace('const GLOBAL_DATA_ADJUSTMENTS = {};', '/* const GLOBAL_DATA_ADJUSTMENTS = {}; */');

const testScript = `
    let allMembers = [{ id: '1', name: '홍길동', course: '한식기능사, 양식기능사' }];
    let calendarYear = 2026;
    let calendarMonth = 1; // February
    let paymentsData = [];
    let holidaysData = [];
    let KOREAN_HOLIDAYS_MAP = {};
    let attendanceData = [];
    let attendanceByMember = {};
    const GLOBAL_DATA_ADJUSTMENTS = {};
    
    ${sharedCalcCode}
    ${smsV3Code}

    document.body.innerHTML = '<div id="calendarDays"></div><div id="calendarTitle"></div><input id="paymentRangeStart" value=""><input id="paymentRangeEnd" value="">';
    try {
        renderRangeCalendar();
        console.log("Calendar rendered! DOM innerHTML length:", document.getElementById('calendarDays').innerHTML.length);
    } catch(e) {
        console.log("CRASH:", e);
    }
`;

const dom = new JSDOM(`<body><script>${testScript}</script></body>`, { runScripts: "dangerously" });
