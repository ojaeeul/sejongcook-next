const fs = require('fs');
const { JSDOM } = require('jsdom');

const html = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

// Extract calculateLocalRedBoxesForMonth function
const match = html.match(/window\.calculateLocalRedBoxesForMonth = function[\s\S]*?};\n/);
if (match) {
    fs.writeFileSync('extracted_func.js', match[0]);
} else {
    console.log("Function not found");
}
