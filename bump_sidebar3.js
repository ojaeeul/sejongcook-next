const fs = require('fs');
const path = require('path');

const dir = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public';

const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
files.forEach(f => {
    const p = path.join(dir, f);
    let content = fs.readFileSync(p, 'utf8');
    content = content.replace(/ai_analyzer\.js\?v=9/g, 'ai_analyzer.js?v=10');
    fs.writeFileSync(p, content, 'utf8');
});
console.log('Bumped ai_analyzer.js cache version to 10');
