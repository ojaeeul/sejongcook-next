const fs = require('fs');
const path = require('path');

const dir = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const injectTag = '<script src="sidebar_sync.js?v=20260622"></script>';

let modifiedCount = 0;
files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (content.includes('sidebar_sync.js')) {
        console.log(`Skipping ${file} (already injected)`);
        return;
    }
    
    // Inject right before </body>
    if (content.includes('</body>')) {
        content = content.replace('</body>', `    ${injectTag}\n</body>`);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Injected into ${file}`);
        modifiedCount++;
    } else {
        console.log(`Could not find </body> in ${file}`);
    }
});

console.log(`Successfully injected into ${modifiedCount} files.`);
