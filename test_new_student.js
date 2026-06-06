const m = { registeredDate: '2026-05-28' };
const uniqueLogs = [];
const currentYear = 2026;
const currentMonth = 5;

let earliestYear = currentYear;
let earliestMonth = currentMonth;

const displayStartDate = m ? (m.start_date || m.registeredDate) : null;
if (displayStartDate) {
    const rd = new Date(displayStartDate);
    if (!isNaN(rd)) {
        earliestYear = rd.getFullYear();
        earliestMonth = rd.getMonth() + 1;
    }
}
if (uniqueLogs.length > 0) {
    // ... not executed
}

if (earliestYear > currentYear || (earliestYear === currentYear && earliestMonth > currentMonth)) {
    earliestYear = currentYear;
    earliestMonth = currentMonth;
}

let iterYear = earliestYear;
let iterMonth = earliestMonth;
let monthsToCalc = [];

while (true) {
    const key = `${iterYear}-${String(iterMonth).padStart(2, '0')}`;
    monthsToCalc.push({ year: iterYear, month: iterMonth, key });
    if (iterYear === currentYear && iterMonth === currentMonth) break;
    iterMonth++;
    if (iterMonth > 12) {
        iterMonth = 1;
        iterYear++;
    }
}
console.log(monthsToCalc);
