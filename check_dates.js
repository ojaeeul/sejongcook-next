const http = require('http');

http.get('http://localhost:8000/api/attendance/list', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const records = JSON.parse(data);
        const missingDates = records.filter(r => !r.date);
        console.log(`Records missing date: ${missingDates.length}`);
        if (missingDates.length > 0) {
            console.log(missingDates[0]);
        }
    });
});
