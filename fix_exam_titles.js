const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const practicalWrittenPath = basePath + 'practical_exam.html';
const practicalSkillPath = basePath + 'practical_exam_skill.html';

function fixFile(filePath, titleText, color) {
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Remove the small text inside <th>
    const smallTextRegex = new RegExp(`<div style="font-size: 0.85rem; color: ${color}; font-weight: bold; margin-bottom: 2px;">${titleText}<\/div>`);
    content = content.replace(smallTextRegex, '');

    // 2. Add large text above the table
    // Look for <table class="exam-table" id="examTable">
    const tableTag = '<table class="exam-table" id="examTable">';
    const largeTitleHtml = `<div style="text-align: left; font-size: 1.5rem; font-weight: 800; color: ${color}; margin-bottom: 10px; padding-left: 5px;">${titleText}</div>\n                            `;
    
    // Ensure we don't add it multiple times if we run this script again
    if (!content.includes(largeTitleHtml)) {
        content = content.replace(tableTag, largeTitleHtml + tableTag);
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

fixFile(practicalWrittenPath, '필기시험', '#3b82f6');
fixFile(practicalSkillPath, '실기시험', '#f59e0b');

console.log('Fixed exam titles successfully.');
