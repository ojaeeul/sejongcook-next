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
    
    // The existing refresh button HTML
    const oldBtn = `<button onclick="location.reload()" style="background: transparent; border: 1px solid #cbd5e1; cursor: pointer; color: #475569; display: flex; align-items: center; gap: 4px; font-size: 0.85rem; font-weight: 600; padding: 6px 12px; border-radius: 6px; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'; this.style.borderColor='#94a3b8'; this.style.color='#0f172a'" onmouseout="this.style.background='transparent'; this.style.borderColor='#cbd5e1'; this.style.color='#475569'" title="페이지 새로고침">
                                    <span class="material-icons" style="font-size: 1.1rem;">refresh</span> 페이지 초기화
                                </button>`;
                                
    const newBtns = `<div class="print-hide" style="display: flex; gap: 8px;">
                                    <button onclick="window.print()" style="background: transparent; border: 1px solid #cbd5e1; cursor: pointer; color: #475569; display: flex; align-items: center; gap: 4px; font-size: 0.85rem; font-weight: 600; padding: 6px 12px; border-radius: 6px; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'; this.style.borderColor='#94a3b8'; this.style.color='#0f172a'" onmouseout="this.style.background='transparent'; this.style.borderColor='#cbd5e1'; this.style.color='#475569'" title="페이지 인쇄">
                                        <span class="material-icons" style="font-size: 1.1rem;">print</span> 인쇄
                                    </button>
                                    <button onclick="location.reload()" style="background: transparent; border: 1px solid #cbd5e1; cursor: pointer; color: #475569; display: flex; align-items: center; gap: 4px; font-size: 0.85rem; font-weight: 600; padding: 6px 12px; border-radius: 6px; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'; this.style.borderColor='#94a3b8'; this.style.color='#0f172a'" onmouseout="this.style.background='transparent'; this.style.borderColor='#cbd5e1'; this.style.color='#475569'" title="페이지 새로고침">
                                        <span class="material-icons" style="font-size: 1.1rem;">refresh</span> 페이지 초기화
                                    </button>
                                </div>`;
    
    if (content.includes(oldBtn)) {
        content = content.replace(oldBtn, newBtns);
        fs.writeFileSync(f.path, content, 'utf8');
        console.log('Updated ' + f.path);
    } else {
        console.log('Button not found in ' + f.path);
    }
});

