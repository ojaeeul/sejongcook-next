const fs = require('fs');

const GLOBAL_DATA_ADJUSTMENTS = {
    "1770517017920": { // 오재을
        "2026-02": { carryOverride: 8.0, forceRedBoxDates: ["2026-02-03"] },
        "2026-04": { carryOverride: 8.0, forceRedBoxDates: ["2026-04-30"] },
        "2026-06": { forceRedBoxDates: ["2026-06-02"] }
    }
};

const m = { id: "1770517017920", registeredDate: "2025-12-10", course: "양식기능사(17:00)", name: "오재을" };
const currentYear = 2026;
const currentMonth = 1;
const rowCourseNameScope = "양식기능사"; 

let earliestYear = currentYear;
let earliestMonth = currentMonth;

if (m && m.registeredDate) {
    const rd = new Date(m.registeredDate);
    if (!isNaN(rd)) {
        earliestYear = rd.getFullYear();
        earliestMonth = rd.getMonth() + 1;
        // Wait, rd.getMonth() + 1 for '2025-12-10' is 12.
        // What does new Date('2025-12-10') return when evaluated in local timezone?
        console.log("Registered Date evaluated:", rd);
        console.log("Earliest Month:", earliestMonth);
        console.log("Earliest Year:", earliestYear);
    }
}
