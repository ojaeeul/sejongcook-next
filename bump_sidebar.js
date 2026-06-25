const fs = require('fs');
const path = require('path');

const dir = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public';

const files = fs.readdirSync(dir);
let count = 0;
for (const file of files) {
    if (file.endsWith('.html')) {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('sidebar_sync.js?v=')) {
            // regex to replace sidebar_sync.js?v=... with sidebar_sync.js?v=20260625-2
            const newContent = content.replace(/sidebar_sync\.js\?v=[\w-]+/g, 'sidebar_sync.js?v=20260625-2');
            if (newContent !== content) {
                fs.writeFileSync(filePath, newContent);
                count++;
            }
        }
    }
}
console.log(`Updated ${count} HTML files.`);
