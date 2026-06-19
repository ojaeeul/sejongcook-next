const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const files = [
    { path: basePath + 'exam.html' },
    { path: basePath + 'exam_skill.html' },
    { path: basePath + 'practical_exam.html' },
    { path: basePath + 'practical_exam_skill.html' }
];

const newSelectHtml = `
                                    <select class="rowsPerPageSelect print-hide" onchange="changeRowsPerPage(this.value)" style="width: auto; padding: 4px 8px; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; font-size: 0.85rem; font-weight: 600; color: #475569; cursor: pointer; background-color: transparent; transition: all 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='transparent'">
                                        <option value="10">10개 보기</option>
                                        <option value="15" selected>15개 보기</option>
                                        <option value="20">20개 보기</option>
                                        <option value="25">25개 보기</option>
                                        <option value="30">30개 보기</option>
                                        <option value="50">50개 보기</option>
                                    </select>`;

files.forEach(f => {
    let content = fs.readFileSync(f.path, 'utf8');
    
    // 1. Remove the old dropdown from the bottom pagination
    // It looks like: <select class="rowsPerPageSelect print-hide" ...> ... </select>
    // We can use a regex to match the <select> element and its contents
    const oldSelectRegex = /<select class="rowsPerPageSelect print-hide"[\s\S]*?<\/select>/g;
    content = content.replace(oldSelectRegex, '');
    
    // 2. Add it to the top right next to the print button
    // The target is: <div class="print-hide" style="display: flex; gap: 8px;">
    const printHideDivRegex = /<div class="print-hide" style="display: flex; gap: 8px;">/g;
    if (content.match(printHideDivRegex)) {
        content = content.replace(printHideDivRegex, `<div class="print-hide" style="display: flex; gap: 8px; align-items: center;">\n${newSelectHtml}`);
        fs.writeFileSync(f.path, content, 'utf8');
        console.log('Updated ' + f.path);
    } else {
        console.log('Target div not found in ' + f.path);
    }
});
