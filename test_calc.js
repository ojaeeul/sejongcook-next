const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const sharedCalcCode = fs.readFileSync('public/sejong/shared_calc.js', 'utf8');

const testScript = `
    let GLOBAL_DATA_ADJUSTMENTS = {};
    ${sharedCalcCode}

    const member = { id: "123", course: "한식기능사", registeredDate: "2025-05-01" };
    const attendanceLogs = [
        { memberId: "123", course: "한식기능사", date: "2026-01-01", status: "present" },
        { memberId: "123", course: "한식기능사", date: "2026-01-02", status: "present" },
        { memberId: "123", course: "한식기능사", date: "2026-01-03", status: "present" },
        { memberId: "123", course: "한식기능사", date: "2026-01-04", status: "present" },
        { memberId: "123", course: "한식기능사", date: "2026-01-05", status: "present" },
        { memberId: "123", course: "한식기능사", date: "2026-01-06", status: "present" },
        { memberId: "123", course: "한식기능사", date: "2026-01-07", status: "present" },
        { memberId: "123", course: "한식기능사", date: "2026-01-08", status: "present" },
        { memberId: "123", course: "한식기능사", date: "2026-01-09", status: "present" },
        { memberId: "123", course: "한식기능사", date: "2026-01-10", status: "present" }
    ];

    const result = window.calculateRedBoxesForMonth(member, 2026, 1, attendanceLogs, "한식기능사", GLOBAL_DATA_ADJUSTMENTS);
    console.log(result);
`;

const dom = new JSDOM(`<body><script>${testScript}</script></body>`, { runScripts: "dangerously" });
