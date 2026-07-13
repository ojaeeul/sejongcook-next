const paymentsData = [];
const currentYear = 2026;
const month = 2;

let schedules = [
    { eighthMonth: 2, eighthDay: 16, isSimulated: true, course: '한식', fee: 500000 }
];

const currentFilterDate = "2026-02-15 to 2026-02-21";
let startM, startD, endM, endD;
let dStart, dEnd;

const parts = currentFilterDate.split(' to ');
dStart = new Date(parts[0]);
dStart.setHours(0,0,0,0);
dEnd = new Date(parts[1]);
dEnd.setHours(23,59,59,999);
startM = dStart.getMonth() + 1;
startD = dStart.getDate();
endM = dEnd.getMonth() + 1;
endD = dEnd.getDate();

const m = { id: 1 };

schedules = schedules.filter(s => {
    const sMonth = s.eighthMonth || month;
    const schedDate = new Date(currentYear, sMonth - 1, s.eighthDay);
    let isMatch = false;

    if (currentFilterDate.includes(' to ')) {
        const parts = currentFilterDate.split(' to ');
        const dStart2 = new Date(parts[0]);
        dStart2.setHours(0,0,0,0);
        const dEnd2 = new Date(parts[1]);
        dEnd2.setHours(23,59,59,999);
        if (schedDate >= dStart2 && schedDate <= dEnd2) isMatch = true;
    } else {
        if (sMonth === startM && s.eighthDay === startD) isMatch = true;
    }

    if (!isMatch) return false;

    const isPaid = false;
    return !isPaid;
});

console.log("Filtered schedules:", schedules);
