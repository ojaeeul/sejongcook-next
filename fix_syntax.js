const fs = require('fs');
let content = fs.readFileSync('public/sejong/tuition_v3.js', 'utf8');

// There are duplicate blocks:
//        const hasJeggwa = myCourses.some(c => c.includes('제과') && !c.includes('제과제빵'));
//        const hasJeppang = myCourses.some(c => c.includes('제빵') && !c.includes('제과제빵'));
//        if (hasJeggwa && hasJeppang) {
//            myCourses = myCourses.filter(c => !c.includes('제과') && !c.includes('제빵'));
//            myCourses.push('제과제빵기능사');
//        }

const dupRegex = /const hasJeggwa = myCourses\.some\(c => c\.includes\('제과'\) && !c\.includes\('제과제빵'\)\);\s*const hasJeppang = myCourses\.some\(c => c\.includes\('제빵'\) && !c\.includes\('제과제빵'\)\);\s*if \(hasJeggwa && hasJeppang\) \{\s*myCourses = myCourses\.filter\(c => !c\.includes\('제과'\) && !c\.includes\('제빵'\)\);\s*myCourses\.push\('제과제빵기능사'\);\s*\}/g;

let count = 0;
content = content.replace(dupRegex, (match) => {
    count++;
    if (count % 2 === 0) return ''; // Remove the second duplicate
    return match;
});

fs.writeFileSync('public/sejong/tuition_v3.js', content, 'utf8');
