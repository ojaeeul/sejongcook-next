
function getFetchUrl(endpoint, isPost = false) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let url = '';
    if (isLocal) {
        if (endpoint === 'settings') {
            url = 'http://localhost:8000/api/admin/data/settings';
        } else {
            url = `http://localhost:8000/api/${endpoint}`;
        }
        return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
    } else {
        const base = `../api.php?board=sejong_${endpoint}`;
        return isPost ? base : base + `&t=${Date.now()}`;
    }
}

const fs = require('fs');

const m = {
  "id": "1770517693101",
  "name": "을",
  "course": "양식기능사(10:00), 제과제빵기능사(17:00)",
  "registeredDate": "2026-02-08"
}; // registration is FEB 2026

const attendanceData = JSON.parse(fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/data/attendance.json', 'utf8'));

// Find "을" logs in Jan
const janLogs = attendanceData.filter(l => String(l.memberId) === m.id && l.date.includes('2026-01'));
console.log("을's Jan Logs:", janLogs);

