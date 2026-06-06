const fs = require('fs');
const code = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf-8');
const scriptMatch = code.match(/<script>(.*?)<\/script>/s);
if (scriptMatch) {
    try {
        new Function(scriptMatch[1]);
        console.log("Syntax is valid!");
    } catch (e) {
        console.error("Syntax Error:", e);
    }
}
