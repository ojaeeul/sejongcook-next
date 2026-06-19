const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const practicalWrittenPath = basePath + 'practical_exam.html';
const practicalSkillPath = basePath + 'practical_exam_skill.html';

// 1. Create a copy for the practical skill page
fs.copyFileSync(practicalWrittenPath, practicalSkillPath);

// 2. Modify practical_exam.html (Cooking - Written)
let writtenContent = fs.readFileSync(practicalWrittenPath, 'utf8');
writtenContent = writtenContent.replace(
    /href="practical_exam.html" class="mp-btn"([^>]*)>\s*<span class="material-icons"[^>]*>edit<\/span> 필기\s*<\/a>/g,
    'href="practical_exam.html" class="mp-btn"$1>\n                            <span class="material-icons" style="font-size: 1.1rem;">edit</span> 필기\n                        </a>'
);
writtenContent = writtenContent.replace(
    /href="practical_exam.html" class="mp-btn"([^>]*)>\s*<span class="material-icons"[^>]*>restaurant<\/span> 실기\s*<\/a>/g,
    'href="practical_exam_skill.html" class="mp-btn"$1>\n                            <span class="material-icons" style="font-size: 1.1rem;">restaurant</span> 실기\n                        </a>'
);
// Insert "필기시험" above "시험일"
writtenContent = writtenContent.replace(
    /시험일\s*<\/th>/,
    '<div style="font-size: 0.85rem; color: #3b82f6; font-weight: bold; margin-bottom: 2px;">필기시험</div>시험일\n                                        </th>'
);
fs.writeFileSync(practicalWrittenPath, writtenContent, 'utf8');


// 3. Modify practical_exam_skill.html (Cooking - Practical)
let skillContent = fs.readFileSync(practicalSkillPath, 'utf8');
skillContent = skillContent.replace(
    /href="practical_exam.html" class="mp-btn"([^>]*)>\s*<span class="material-icons"[^>]*>edit<\/span> 필기\s*<\/a>/g,
    'href="practical_exam.html" class="mp-btn"$1>\n                            <span class="material-icons" style="font-size: 1.1rem;">edit</span> 필기\n                        </a>'
);
skillContent = skillContent.replace(
    /href="practical_exam.html" class="mp-btn"([^>]*)>\s*<span class="material-icons"[^>]*>restaurant<\/span> 실기\s*<\/a>/g,
    'href="practical_exam_skill.html" class="mp-btn"$1>\n                            <span class="material-icons" style="font-size: 1.1rem;">restaurant</span> 실기\n                        </a>'
);
// Insert "실기시험" above "시험일"
skillContent = skillContent.replace(
    /시험일\s*<\/th>/,
    '<div style="font-size: 0.85rem; color: #f59e0b; font-weight: bold; margin-bottom: 2px;">실기시험</div>시험일\n                                        </th>'
);
fs.writeFileSync(practicalSkillPath, skillContent, 'utf8');

console.log('Successfully configured Cooking Exam pages (Written and Practical).');
