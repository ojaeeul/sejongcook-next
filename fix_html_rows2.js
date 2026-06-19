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
    
    // Change id="rowsPerPage" to class="rowsPerPageSelect" and pass this.value
    content = content.replace(/id="rowsPerPage"/g, 'class="rowsPerPageSelect print-hide"');
    content = content.replace(/onchange="changeRowsPerPage\(\)"/g, 'onchange="changeRowsPerPage(this.value)"');
    
    fs.writeFileSync(f.path, content, 'utf8');
    console.log('Updated HTML ' + f.path);
});

const jsFiles = [
    { path: basePath + 'exam.js' },
    { path: basePath + 'practical_exam.js' }
];

jsFiles.forEach(f => {
    let content = fs.readFileSync(f.path, 'utf8');
    
    // Update JS to read from window.currentRowsPerPage or just the first select
    // Wait, the new changeRowsPerPage(val) should set a global variable
    content = content.replace(/const rowsSelect = document\.getElementById\('rowsPerPage'\);/g, 'const rowsSelect = document.querySelector(".rowsPerPageSelect");');
    
    // Update changeRowsPerPage function to accept value and sync dropdowns
    content = content.replace(/function changeRowsPerPage\(\) {/g, 'function changeRowsPerPage(val) {\n    document.querySelectorAll(".rowsPerPageSelect").forEach(s => s.value = val);');
    
    fs.writeFileSync(f.path, content, 'utf8');
    console.log('Updated JS ' + f.path);
});
