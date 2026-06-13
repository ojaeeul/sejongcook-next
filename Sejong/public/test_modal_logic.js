const fs = require('fs');
const members = JSON.parse(fs.readFileSync('test_members.json', 'utf8'));

// find 길삼이
const gil = members.find(m => m.name === '길삼이');
console.log("Gil-sam found:", !!gil);
if (gil) {
    console.log("Gil-sam courses:", gil.course);
    const courses = gil.course.split(',').map(c => c.trim()).filter(c => c);
    console.log("Split courses:", courses);
}

