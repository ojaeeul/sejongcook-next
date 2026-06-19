const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';

const jsFiles = [
    { path: basePath + 'exam.js' },
    { path: basePath + 'practical_exam.js' }
];

jsFiles.forEach(f => {
    let content = fs.readFileSync(f.path, 'utf8');
    
    // In JS we currently have:
    // const rowsSelect = document.querySelector(".rowsPerPageSelect");
    // const rowsPerPage = rowsSelect ? parseInt(rowsSelect.value, 10) : 15;
    // window.isViewAllPages = false; // Disable view all pages so pagination works
    //
    // function changeRowsPerPage(val) {
    //     document.querySelectorAll(".rowsPerPageSelect").forEach(s => s.value = val);
    //     currentPage = 1;
    //     renderExamTable();
    // }
    
    const target1 = /const rowsSelect = document\.querySelector\("\.rowsPerPageSelect"\);\n\s*const rowsPerPage = rowsSelect \? parseInt\(rowsSelect\.value, 10\) : 15;/;
    const new1 = `const rowsSelect = document.querySelector(".rowsPerPageSelect");
        
        // Restore from localStorage if available
        const savedRows = localStorage.getItem('examRowsPerPage');
        if (savedRows && rowsSelect) {
            document.querySelectorAll(".rowsPerPageSelect").forEach(s => s.value = savedRows);
        }
        
        const rowsPerPage = rowsSelect ? parseInt(rowsSelect.value, 10) : (savedRows ? parseInt(savedRows, 10) : 15);`;
        
    const target2 = /function changeRowsPerPage\(val\) {\n\s*document\.querySelectorAll\("\.rowsPerPageSelect"\)\.forEach\(s => s\.value = val\);/;
    const new2 = `function changeRowsPerPage(val) {\n    localStorage.setItem('examRowsPerPage', val);\n    document.querySelectorAll(".rowsPerPageSelect").forEach(s => s.value = val);`;

    if (content.match(target1)) {
        content = content.replace(target1, new1);
    }
    
    if (content.match(target2)) {
        content = content.replace(target2, new2);
    }
    
    fs.writeFileSync(f.path, content, 'utf8');
    console.log('Updated JS: ' + f.path);
});
