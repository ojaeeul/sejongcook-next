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
    
    // Add option value="5" before option value="10"
    if (!content.includes('<option value="5">5개 보기</option>')) {
        content = content.replace('<option value="10">10개 보기</option>', '<option value="5">5개 보기</option>\n                                        <option value="10">10개 보기</option>');
        fs.writeFileSync(f.path, content, 'utf8');
        console.log('Added 5 rows to ' + f.path);
    } else {
        console.log('Already added in ' + f.path);
    }
});
