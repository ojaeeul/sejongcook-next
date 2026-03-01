import fs from 'fs';
import path from 'path';
import { globSync } from 'glob';

// Add ?_t=Date.now() to all /api/admin/data/ fetches in edit and view pages
const files = globSync('app/**/*.tsx');
let fixedCount = 0;

for (const file of files) {
    if (file.includes('/edit/') || file.includes('/view/') || file.includes('/write/')) {
        let content = fs.readFileSync(file, 'utf-8');
        let modified = false;

        // Pattern 1: const url = '/api/admin/data/some-board';
        const regex1 = /const\s+url\s*=\s*['"](\/api\/admin\/data\/[^'"]+)['"]/g;
        if (regex1.test(content)) {
            content = content.replace(regex1, "const url = '$1?_t=' + Date.now()");
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(file, content, 'utf-8');
            fixedCount++;
            console.log(`Fixed: ${file}`);
        }
    }
}
console.log(`Fixed ${fixedCount} files`);
