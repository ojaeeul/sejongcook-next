const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const practicalWrittenPath = basePath + 'practical_exam.html';
const practicalSkillPath = basePath + 'practical_exam_skill.html';

function fixButtons(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Button 1: 조리 -> 필기
    content = content.replace(
        /<span class="material-icons"([^>]*)>restaurant<\/span>\s*조리/g,
        '<span class="material-icons"$1>edit</span> 필기'
    );

    // Button 2: 제과제빵 -> 실기
    content = content.replace(
        /<span class="material-icons"([^>]*)>bakery_dining<\/span>\s*제과제빵/g,
        '<span class="material-icons"$1>restaurant</span> 실기'
    );

    fs.writeFileSync(filePath, content, 'utf8');
}

fixButtons(practicalWrittenPath);
fixButtons(practicalSkillPath);

console.log('Fixed Cooking Exam buttons successfully.');
