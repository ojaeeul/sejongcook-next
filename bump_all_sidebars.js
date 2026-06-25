const fs = require('fs');
const path = require('path');

const dirs = [
    './Sejong/SejongAttendance/public',
    './Sejong/public',
    './public/sejong'
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
    files.forEach(f => {
        const p = path.join(dir, f);
        let content = fs.readFileSync(p, 'utf8');
        // Replace any version of sidebar_sync.js?v=... with sidebar_sync.js?v=ai1
        content = content.replace(/sidebar_sync\.js\?v=[a-zA-Z0-9_-]+/g, 'sidebar_sync.js?v=ai2');
        fs.writeFileSync(p, content, 'utf8');
    });
});
console.log('Bumped sidebar_sync.js in all public folders!');
