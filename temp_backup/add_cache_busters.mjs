import fs from 'fs';
import path from 'path';

function walk(dir, regex, callback) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath, regex, callback);
        } else if (regex.test(f)) {
            callback(fullPath);
        }
    }
}

let count = 0;
walk(path.join(process.cwd(), 'app'), /\.tsx$/, (filePath) => {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // Pattern for simple URL fetch definitions lacking a cache buster
    const regex1 = /(const|let)\s+url\s*=\s*['"](\/api\/admin\/data\/[a-zA-Z0-9-]+)['"](?!\s*\+\s*Date\.now\(\))/g;
    content = content.replace(regex1, "$1 url = '$2?_t=' + Date.now()");

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        count++;
        console.log(`Updated cache buster in ${filePath}`);
    }
});
console.log(`Total fixed: ${count}`);
