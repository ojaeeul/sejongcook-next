const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const files = [
    { path: basePath + 'exam.html' },
    { path: basePath + 'exam_skill.html' },
    { path: basePath + 'practical_exam.html' },
    { path: basePath + 'practical_exam_skill.html' }
];

files.forEach(f => {
    let content = fs.readFileSync(f.path, 'utf8');
    
    // The previous replacement was:
    // onclick="window.location.href = window.location.pathname + '?reset=' + new Date().getTime()"
    
    const newString = 'onclick="clearCurrentPageData()"';
    
    // Regex to match the exact previous replacement (escaping single quotes and question marks)
    const regex = /onclick="window\.location\.href = window\.location\.pathname \+ '\?reset=' \+ new Date\(\)\.getTime\(\)"/g;
    
    if (content.match(regex)) {
        content = content.replace(regex, newString);
        fs.writeFileSync(f.path, content, 'utf8');
        console.log('Updated ' + f.path);
    } else {
        console.log('Not found in ' + f.path);
    }
});
