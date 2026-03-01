let currentYear = 2026;
let currentMonth = 1; // User is viewing Jan

// Suppose earliest log is in Mar
let earliestYear = 2026;
let earliestMonth = 3; 

// The code does this:
let iterYear = earliestYear;
let iterMonth = earliestMonth;

let monthsToCalc = [];
let failsafe = 0;
while (true) {
    if (failsafe++ > 24) { console.log("Infinite Loop!"); break; }
    const key = `${iterYear}-${String(iterMonth).padStart(2, '0')}`;
    monthsToCalc.push({ year: iterYear, month: iterMonth, key });
    
    // Breaking condition
    if (iterYear === currentYear && iterMonth === currentMonth) break;
    
    iterMonth++;
    if (iterMonth > 12) {
        iterMonth = 1;
        iterYear++;
    }
}
console.log(monthsToCalc.length);
