const GLOBAL_DATA_ADJUSTMENTS = {};

const m = { id: "1770517017920", registeredDate: "2025-12-10" };
const currentYear = 2026;
const currentMonth = 1;

let earliestYear = currentYear;
let earliestMonth = currentMonth;
if (m && m.registeredDate) {
    const rd = new Date(m.registeredDate);
    earliestYear = rd.getFullYear();
    earliestMonth = rd.getMonth() + 1;
}

const monthsToCalc = [];
let iterYear = earliestYear;
let iterMonth = earliestMonth;

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

let carryOverP = 0;
monthsToCalc.forEach(mc => {
    let manualMakeup = 0; 
    let attendances = 0; // assumes 0 records
    let totalCombined = Math.round((carryOverP + manualMakeup + attendances) * 10) / 10;
    
    mc.carryFromPrev = carryOverP;
    let vRaw = Math.round(totalCombined * 10);
    
    if (vRaw <= 80) {
        mc.m_J = 0;
        mc.m_P = vRaw / 10;
    } else {
        mc.m_J = 8;
        let pRaw = vRaw - 80;
        mc.m_P = (((pRaw - 10) % 80 + 80) % 80 + 10) / 10;
    }
    carryOverP = totalCombined;
});

console.log(monthsToCalc);
