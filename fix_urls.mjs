import fs from 'fs';
import path from 'path';

function fixUrlsInDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixUrlsInDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Replace previous /api or loca.lt with /api/sejong
            content = content.replace(/['"]https?:\/\/[a-zA-Z0-9-]+\.loca\.lt\/api['"]/g, "'/api/sejong'");

            // Replace simple hardcoded localhost with the dynamic check specifically for Vercel
            content = content.replace(/const API_BASE\s*=\s*window\.location\.hostname\s*===\s*['"]localhost['"]\s*\|\|\s*window\.location\.hostname\s*===\s*['"]127\.0\.0\.1['"]\s*\?\s*['"]http:\/\/localhost:8000\/api['"]\s*:\s*['"]\/api['"];/g,
                "const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000/api' : '/api/sejong';");

            content = content.replace(/const SHEET_API_BASE\s*=\s*window\.location\.hostname\s*===\s*['"]localhost['"]\s*\|\|\s*window\.location\.hostname\s*===\s*['"]127\.0\.0\.1['"]\s*\?\s*['"]http:\/\/localhost:8000\/api['"]\s*:\s*['"]\/api['"];/g,
                "const SHEET_API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000/api' : '/api/sejong';");

            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

fixUrlsInDir(path.join(process.cwd(), 'Sejong/SejongAttendance/public'));
fixUrlsInDir(path.join(process.cwd(), 'Sejong/public'));
fixUrlsInDir(path.join(process.cwd(), 'public/sejong'));
