const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

content = content.replace(/const cName = r\.courseName \|\| '';/g, 'const cName = r.courseFull || r.courseName || "";');
content = content.replace(/const cName = r\.courseName \|\| "";/g, 'const cName = r.courseFull || r.courseName || "";');

// Update version string again to force cache reload
content = content.replace(/v=202606110045/g, 'v=202606110050');

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');
