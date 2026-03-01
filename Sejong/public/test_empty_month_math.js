let carryOverP = 0;
let manualMakeup = 0;
let attendances = 0;

let totalCombined = Math.round((carryOverP + manualMakeup + attendances) * 10) / 10;
let vRaw = Math.round(totalCombined * 10);

let m_P;
if (vRaw <= 80) {
    // mc.m_J = 0;
    m_P = vRaw / 10;
} else {
    // mc.m_J = 8;
    let pRaw = vRaw - 80;
    m_P = (((pRaw - 10) % 80 + 80) % 80 + 10) / 10;
}

console.log("If 0 -> vRaw:", vRaw, "m_P:", m_P);

carryOverP = 0.5; // What if it is 0.5?
vRaw = Math.round(carryOverP * 10);
if (vRaw <= 80) {
    m_P = vRaw / 10;
} else {
    let pRaw = vRaw - 80;
    m_P = (((pRaw - 10) % 80 + 80) % 80 + 10) / 10;
}
console.log("If 0.5 -> vRaw:", vRaw, "m_P:", m_P);

