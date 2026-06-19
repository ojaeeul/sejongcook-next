const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const files = [
    { path: basePath + 'exam.html', title: '필기시험', color: '#3b82f6' },
    { path: basePath + 'exam_skill.html', title: '실기시험', color: '#f59e0b' },
    { path: basePath + 'practical_exam.html', title: '필기시험', color: '#3b82f6' },
    { path: basePath + 'practical_exam_skill.html', title: '실기시험', color: '#f59e0b' }
];

files.forEach(f => {
    let content = fs.readFileSync(f.path, 'utf8');
    
    const targetString = `<div style="text-align: left; font-size: 1.5rem; font-weight: 800; color: ${f.color}; margin-bottom: 10px; padding-left: 5px;">${f.title}</div>`;
    
    const newHtml = `<div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 10px; padding-left: 5px; padding-right: 5px;">
                                <div style="text-align: left; font-size: 1.5rem; font-weight: 800; color: ${f.color}; line-height: 1;">${f.title}</div>
                                <button onclick="location.reload()" style="background: transparent; border: 1px solid #cbd5e1; cursor: pointer; color: #475569; display: flex; align-items: center; gap: 4px; font-size: 0.85rem; font-weight: 600; padding: 6px 12px; border-radius: 6px; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'; this.style.borderColor='#94a3b8'; this.style.color='#0f172a'" onmouseout="this.style.background='transparent'; this.style.borderColor='#cbd5e1'; this.style.color='#475569'" title="페이지 새로고침">
                                    <span class="material-icons" style="font-size: 1.1rem;">refresh</span> 페이지 초기화
                                </button>
                            </div>`;
                            
    if (content.includes(targetString)) {
        content = content.replace(targetString, newHtml);
        fs.writeFileSync(f.path, content, 'utf8');
    }
});

console.log('Added refresh buttons successfully.');
