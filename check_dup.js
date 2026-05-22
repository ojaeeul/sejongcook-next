const fs = require('fs');
const data = JSON.parse(fs.readFileSync('Sejong/SejongAttendance/data/attendance.json', 'utf8'));
const map = {};
data.forEach(d => {
    const key = d.memberId + '_' + d.date;
    if (!map[key]) map[key] = [];
    map[key].push(d);
});
let dupCount = 0;
for (const k in map) {
    if (map[k].length > 1) {
        console.log("DUP:", k, map[k]);
        dupCount++;
    }
}
console.log("Total duplicates:", dupCount);
