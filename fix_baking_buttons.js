const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const examWrittenPath = basePath + 'exam.html';
const examSkillPath = basePath + 'exam_skill.html';

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

    // Link updates (in case they point to themselves incorrectly)
    content = content.replace(/href="exam.html"([^>]*>)\s*<span class="material-icons"[^>]*>restaurant<\/span> 실기/g, 'href="exam_skill.html"$1\n                            <span class="material-icons" style="font-size: 1.2rem; line-height: 1;">restaurant</span> 실기');
    
    // Make sure Button 2 points to exam_skill.html
    // Let's just do a brute-force replace on the hrefs if needed
    // First button (blue):
    content = content.replace(/<a href="exam.html"([^>]*)background: #3b82f6([^>]*)>\s*<span class="material-icons"[^>]*>edit<\/span> 필기/g, '<a href="exam.html"$1background: #3b82f6$2>\n                            <span class="material-icons" style="font-size: 1.2rem; line-height: 1;">edit</span> 필기');
    // Second button (orange):
    content = content.replace(/<a href="exam.html"([^>]*)background: #f59e0b([^>]*)>\s*<span class="material-icons"[^>]*>restaurant<\/span> 실기/g, '<a href="exam_skill.html"$1background: #f59e0b$2>\n                            <span class="material-icons" style="font-size: 1.2rem; line-height: 1;">restaurant</span> 실기');
    
    fs.writeFileSync(filePath, content, 'utf8');
}

fixButtons(examWrittenPath);
fixButtons(examSkillPath);

console.log('Fixed Baking Exam buttons successfully.');
