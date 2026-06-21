const fs = require('fs');
const ledgerPath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js';
const sharedCalcPath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js';
// Just search for Gil-sam's attendance in data.json?
const dataPath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong/data.json';
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let target = null;
data.forEach(d => {
    if (d.name === '길삼이' && d.course === '일식기능사(19:00)') {
        target = d;
    }
});
if (!target) {
    data.forEach(d => {
        if (d.name === '길삼이') console.log(d.name, d.course);
    });
} else {
    console.log("Found Gil-sam Ilshik:");
    console.log("Attendances:", target.attendances);
    console.log("Expected Days:", target.expectedDays);
    console.log("Makeup:", target.makeupCount);
}
