const fs = require('fs');
const file = 'Sejong/SejongAttendance/data/attendance.json';
let data = JSON.parse(fs.readFileSync(file, 'utf8'));

// We want to keep only the latest record for each memberId + date
const keep = {};
for (const log of data) {
    const key = log.memberId + '_' + log.date;
    // Overwrite with the latest one (which is usually at the end of the array)
    // But if one has a more specific course vs a comma-separated one... 
    // actually just keeping the last one is fine, as it's the most recent action.
    keep[key] = log;
}

const cleaned = Object.values(keep);
fs.writeFileSync(file, JSON.stringify(cleaned, null, 4));
console.log('Cleaned', data.length - cleaned.length, 'duplicates');
