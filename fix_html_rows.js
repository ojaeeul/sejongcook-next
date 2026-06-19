const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const files = [
    { path: basePath + 'exam.html' },
    { path: basePath + 'exam_skill.html' },
    { path: basePath + 'practical_exam.html' },
    { path: basePath + 'practical_exam_skill.html' }
];

const selectHtml = `
                        <select id="rowsPerPage" onchange="changeRowsPerPage()" class="print-hide" style="margin-left: 20px; padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none; font-size: 0.95rem; font-weight: 600; color: #475569; cursor: pointer; background-color: #f8fafc;">
                            <option value="10">10개씩 보기</option>
                            <option value="15" selected>15개씩 보기</option>
                            <option value="20">20개씩 보기</option>
                            <option value="25">25개씩 보기</option>
                            <option value="30">30개씩 보기</option>
                            <option value="50">50개씩 보기</option>
                        </select>
`;

files.forEach(f => {
    let content = fs.readFileSync(f.path, 'utf8');
    
    // There are top and bottom pagination controls.
    // The previous structure is:
    // <button class="page-btn" onclick="nextPage()" ...>다음 장 ▶</button>
    // We can replace the end of that button with the button + the select box.
    // We must do it globally so it applies to both top and bottom pagination.
    
    // regex to find the nextPage button
    const targetRegex = /(<button[^>]*onclick="nextPage\(\)"[^>]*>다음 장 ▶<\/button>)/g;
    
    // Only replace if not already replaced
    if (content.includes('id="rowsPerPage"')) {
        console.log('Already added to ' + f.path);
        return;
    }
    
    if (content.match(targetRegex)) {
        content = content.replace(targetRegex, `$1${selectHtml}`);
        fs.writeFileSync(f.path, content, 'utf8');
        console.log('Updated HTML: ' + f.path);
    } else {
        console.log('Not found in HTML: ' + f.path);
    }
});
