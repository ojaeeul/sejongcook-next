const fs = require('fs');
const path = require('path');

const SEJONG_DIR = path.join(__dirname, 'public', 'sejong');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.js') || file.endsWith('.html')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(SEJONG_DIR);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace strict /api/sejong/ paths
    content = content.replace(/'\/api\/sejong\/([^']+)'/g, "'../api.php?board=sejong_$1'");
    content = content.replace(/"\/api\/sejong\/([^"]+)"/g, '"../api.php?board=sejong_$1"');
    content = content.replace(/`\/api\/sejong\/([^`]+)`/g, '`../api.php?board=sejong_$1`');

    // Fix API_BASE definitions
    content = content.replace(/const API_BASE = ['"`]\$\{window\.location\.origin\}\/api\/sejong['"`];/g, "const API_BASE = '../api.php?board=sejong_';");
    content = content.replace(/const API_BASE = ['"`]\/api\/sejong['"`];/g, "const API_BASE = '../api.php?board=sejong_';");
    content = content.replace(/const SHEET_API_BASE = ['"`]\$\{window\.location\.origin\}\/api\/sejong['"`];/g, "const SHEET_API_BASE = '../api.php?board=sejong_';");

    // Fix template literal usages of API_BASE
    content = content.replace(/\$\{API_BASE\}\/([a-zA-Z_-]+)/g, '${API_BASE}$1');
    content = content.replace(/\$\{SHEET_API_BASE\}\/([a-zA-Z_-]+)/g, '${SHEET_API_BASE}$1');
    content = content.replace(/API_BASE \+ '\/([a-zA-Z_-]+)/g, "API_BASE + '$1");
    content = content.replace(/SHEET_API_BASE \+ '\/([a-zA-Z_-]+)/g, "SHEET_API_BASE + '$1");

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated: ' + path.basename(file));
    }
});
console.log('All API replacements completed.');
