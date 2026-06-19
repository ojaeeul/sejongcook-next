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
    
    const targetString = 'onclick="location.reload()"';
    const newString = 'onclick="window.location.href = window.location.pathname + \'?reset=\' + new Date().getTime()"';
    
    if (content.includes(targetString)) {
        // Replace ONLY the one in the "페이지 초기화" button if possible, 
        // or just replace all instances of location.reload() which are for reset buttons anyway.
        content = content.replace(/onclick="location\.reload\(\)"/g, newString);
        fs.writeFileSync(f.path, content, 'utf8');
        console.log('Updated ' + f.path);
    } else {
        console.log('Not found in ' + f.path);
    }
});

