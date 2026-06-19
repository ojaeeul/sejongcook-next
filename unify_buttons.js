const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const practicalWrittenPath = basePath + 'practical_exam.html';
const practicalSkillPath = basePath + 'practical_exam_skill.html';
const examWrittenPath = basePath + 'exam.html';
const examSkillPath = basePath + 'exam_skill.html';

const desiredButtonsHtml = `<a href="REPLACE_LINK_1" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 16px; border-radius: 8px; background: #3b82f6; color: white; font-weight: 600; font-size: 0.9rem; box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3); transition: transform 0.2s, box-shadow 0.2s; white-space: nowrap; line-height: 1;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 6px rgba(59, 130, 246, 0.4)'" onmouseout="this.style.transform='none'; this.style.boxShadow='0 2px 4px rgba(59, 130, 246, 0.3)'">
                            <span class="material-icons" style="font-size: 1.2rem; line-height: 1;">edit</span> 필기
                        </a>
                        <a href="REPLACE_LINK_2" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 6px 16px; border-radius: 8px; background: #f59e0b; color: white; font-weight: 600; font-size: 0.9rem; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3); transition: transform 0.2s, box-shadow 0.2s; white-space: nowrap; line-height: 1;" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 6px rgba(245, 158, 11, 0.4)'" onmouseout="this.style.transform='none'; this.style.boxShadow='0 2px 4px rgba(245, 158, 11, 0.3)'">
                            <span class="material-icons" style="font-size: 1.2rem; line-height: 1;">restaurant</span> 실기
                        </a>`;

function updateButtons(filePath, link1, link2) {
    let content = fs.readFileSync(filePath, 'utf8');
    const newButtons = desiredButtonsHtml.replace('REPLACE_LINK_1', link1).replace('REPLACE_LINK_2', link2);
    
    // Replace existing button div content
    content = content.replace(/<div style="display: flex; gap: 10px;">[\s\S]*?<\/div>\n\s*<\/div>\n\s*<\/header>/, `<div style="display: flex; gap: 10px;">\n                        ${newButtons}\n                    </div>\n                </div>\n            </header>`);
    
    fs.writeFileSync(filePath, content, 'utf8');
}

updateButtons(practicalWrittenPath, 'practical_exam.html', 'practical_exam_skill.html');
updateButtons(practicalSkillPath, 'practical_exam.html', 'practical_exam_skill.html');
updateButtons(examWrittenPath, 'exam.html', 'exam_skill.html');
updateButtons(examSkillPath, 'exam.html', 'exam_skill.html');

console.log('Unified all buttons.');
