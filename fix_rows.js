const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const files = [
    { path: basePath + 'exam.js' },
    { path: basePath + 'practical_exam.js' }
];

files.forEach(f => {
    let content = fs.readFileSync(f.path, 'utf8');
    
    // Replace:
    // window.isViewAllPages = true; // Always view all pages with this new layout
    // const rowsPerPage = window.isViewAllPages ? Math.max(filteredData.length, 15) : 15;
    
    const targetRegex = /window\.isViewAllPages\s*=\s*true;[^\n]*\n\s*const rowsPerPage\s*=[^;]+;/;
    
    const newString = `        const rowsSelect = document.getElementById('rowsPerPage');
        const rowsPerPage = rowsSelect ? parseInt(rowsSelect.value, 10) : 15;
        window.isViewAllPages = false; // Disable view all pages so pagination works`;

    if (content.match(targetRegex)) {
        content = content.replace(targetRegex, newString);
        
        // Also add changeRowsPerPage function if it doesn't exist
        if (!content.includes('function changeRowsPerPage')) {
            content += `\nfunction changeRowsPerPage() {\n    currentPage = 1;\n    renderExamTable();\n}\n`;
        }
        
        fs.writeFileSync(f.path, content, 'utf8');
        console.log('Updated JS: ' + f.path);
    } else {
        console.log('Not found in JS: ' + f.path);
    }
});
