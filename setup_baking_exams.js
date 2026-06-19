const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const examWrittenPath = basePath + 'exam.html';
const examSkillPath = basePath + 'exam_skill.html';

// 1. Create a copy for the practical skill page
fs.copyFileSync(examWrittenPath, examSkillPath);

// 2. Modify exam.html (Baking - Written)
let writtenContent = fs.readFileSync(examWrittenPath, 'utf8');

// Update button links
writtenContent = writtenContent.replace(
    /href="exam.html" class="mp-btn"([^>]*)>\s*<span class="material-icons"[^>]*>edit<\/span> 필기\s*<\/a>/g,
    'href="exam.html" class="mp-btn"$1>\n                            <span class="material-icons" style="font-size: 1.1rem;">edit</span> 필기\n                        </a>'
);
writtenContent = writtenContent.replace(
    /href="exam.html" class="mp-btn"([^>]*)>\s*<span class="material-icons"[^>]*>restaurant<\/span> 실기\s*<\/a>/g,
    'href="exam_skill.html" class="mp-btn"$1>\n                            <span class="material-icons" style="font-size: 1.1rem;">restaurant</span> 실기\n                        </a>'
);

// Add large text above table if not exists
const tableTag = '<table class="exam-table" id="examTable">';
const largeTitleWrittenHtml = `<div style="text-align: left; font-size: 1.5rem; font-weight: 800; color: #3b82f6; margin-bottom: 10px; padding-left: 5px;">필기시험</div>\n                            `;
if (!writtenContent.includes(largeTitleWrittenHtml)) {
    writtenContent = writtenContent.replace(tableTag, largeTitleWrittenHtml + tableTag);
}

fs.writeFileSync(examWrittenPath, writtenContent, 'utf8');


// 3. Modify exam_skill.html (Baking - Practical)
let skillContent = fs.readFileSync(examSkillPath, 'utf8');

// Update button links
skillContent = skillContent.replace(
    /href="exam.html" class="mp-btn"([^>]*)>\s*<span class="material-icons"[^>]*>edit<\/span> 필기\s*<\/a>/g,
    'href="exam.html" class="mp-btn"$1>\n                            <span class="material-icons" style="font-size: 1.1rem;">edit</span> 필기\n                        </a>'
);
skillContent = skillContent.replace(
    /href="exam.html" class="mp-btn"([^>]*)>\s*<span class="material-icons"[^>]*>restaurant<\/span> 실기\s*<\/a>/g,
    'href="exam_skill.html" class="mp-btn"$1>\n                            <span class="material-icons" style="font-size: 1.1rem;">restaurant</span> 실기\n                        </a>'
);

// Add large text above table
const largeTitleSkillHtml = `<div style="text-align: left; font-size: 1.5rem; font-weight: 800; color: #f59e0b; margin-bottom: 10px; padding-left: 5px;">실기시험</div>\n                            `;
if (!skillContent.includes(largeTitleSkillHtml)) {
    skillContent = skillContent.replace(tableTag, largeTitleSkillHtml + tableTag);
}

fs.writeFileSync(examSkillPath, skillContent, 'utf8');

console.log('Successfully configured Baking Exam pages (Written and Practical).');
