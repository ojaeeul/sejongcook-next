import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const dirPath = path.join(dir, f);
        const stat = fs.statSync(dirPath);
        if (stat.isDirectory()) {
            walkDir(dirPath, callback);
        } else {
            if (dirPath.endsWith('.js') || dirPath.endsWith('.html')) {
                callback(dirPath);
            }
        }
    }
}

function upgradeFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // 1. Convert complex API_BASE definitions
    const apiBaseRegex1 = /const\s+API_BASE\s*=\s*window\.location\.hostname[^;]+;/g;
    content = content.replace(apiBaseRegex1, "const API_BASE = '/api/sejong';");

    // 2. Convert complex SHEET_API_BASE definitions
    const apiBaseRegex2 = /const\s+SHEET_API_BASE\s*=\s*window\.location\.hostname[^;]+;/g;
    content = content.replace(apiBaseRegex2, "const SHEET_API_BASE = '/api/sejong';");

    // 3. Replace direct localhost:8000 calls
    content = content.replace(/['"`]http:\/\/localhost:8000\/api\/admin\/data\/settings([^'"`]*)['"`]/g, "`${API_BASE}/settings$1`");
    content = content.replace(/['"`]http:\/\/localhost:8000\/api([^'"`]*)['"`]/g, "`${API_BASE}$1`");

    // 4. Sometimes it's fetch('http://localhost:8000/api/admin/data/settings', ...) which becomes fetch(`${API_BASE}/settings`, ...)
    // If we used backticks, it's fine.

    // 5. Replace simple /api or loca.lt calls just in case they survived
    content = content.replace(/['"]https?:\/\/[a-zA-Z0-9-]+\.loca\.lt\/api([^'"]*)['"]/g, "`${API_BASE}$1`");

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Upgraded:', filePath);
    }
}

console.log('Starting Supabase + Vercel Upgrade...');
walkDir(path.join(process.cwd(), 'Sejong/public'), upgradeFile);
walkDir(path.join(process.cwd(), 'public/sejong'), upgradeFile);
walkDir(path.join(process.cwd(), 'Sejong/SejongAttendance/public'), upgradeFile);
console.log('Upgrade complete!');
