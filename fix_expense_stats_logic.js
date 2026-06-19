const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const filePath = basePath + 'expense_stats.js';

let content = fs.readFileSync(filePath, 'utf8');

// The original logic
// let amountText = aCol.textContent.trim();
// let descText = descCol.textContent.trim();
// if(!amountText || !descText) return;

content = content.replace(
    /if\(!amountText\s*\|\|\s*!descText\)\s*return;/g,
    'if(!amountText && !descText) return;'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated expense_stats.js logic to allow entries with only description or only amount.');
