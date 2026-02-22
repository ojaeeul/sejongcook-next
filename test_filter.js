const currentFilterDate = "2026-02-15 to 2026-02-21";
let dStart, dEnd;
const parts = currentFilterDate.split(' to ');
dStart = new Date(parts[0]);
dStart.setHours(0, 0, 0, 0);
dEnd = new Date(parts[1]);
dEnd.setHours(23, 59, 59, 999);
console.log(dStart, dEnd);

const currentYear = 2026;
const sMonth = 2;
const eighthDay = 16;
const schedDate = new Date(currentYear, sMonth - 1, eighthDay);
let isMatch = false;

if (schedDate >= dStart && schedDate <= dEnd) isMatch = true;
console.log(isMatch);
