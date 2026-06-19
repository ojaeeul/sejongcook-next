const fs = require('fs');
const path1 = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam.js';
const path2 = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/practical_exam.js';

function patchFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add populateCourseFilter() to the beginning of renderExamTable()
    if (!content.includes('populateCourseFilter(); // Update dropdown options')) {
        content = content.replace('function renderExamTable() {\n    const tbody = document.getElementById(\'examTbody\');', 
            'function renderExamTable() {\n    populateCourseFilter(); // Update dropdown options\n    const tbody = document.getElementById(\'examTbody\');');
        fs.writeFileSync(file, content, 'utf8');
    }
}

patchFile(path1);
patchFile(path2);
console.log('Patched exam js files again!');
