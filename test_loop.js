const currentYear = 2026;
const currentMonth = 1;

let earliestYear = 2025;
let earliestMonth = 12;

let iterYear = earliestYear;
let iterMonth = earliestMonth;

let monthsToCalc = [];
while (true) {
    const key = `${iterYear}-${String(iterMonth).padStart(2, '0')}`;
    monthsToCalc.push({ year: iterYear, month: iterMonth, key });
    
    // Breaking before increment means it includes currentMonth but nothing after.
    if (iterYear === currentYear && iterMonth === currentMonth) break;
    
    iterMonth++;
    if (iterMonth > 12) {
        iterMonth = 1;
        iterYear++;
    }
}
console.log(monthsToCalc);
