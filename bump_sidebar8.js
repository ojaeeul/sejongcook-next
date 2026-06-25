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
        content = content.replace(/ai_analyzer\.js\?v=[a-zA-Z0-9_-]+/g, 'ai_analyzer.js?v=ai6');
        content = content.replace(/sidebar_sync\.js\?v=[a-zA-Z0-9_-]+/g, 'sidebar_sync.js?v=ai6');
        fs.writeFileSync(p, content, 'utf8');
    });
});
console.log('Bumped cache versions in all public folders!');
