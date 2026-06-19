const fs = require('fs');
const path1 = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam.js';
const path2 = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/practical_exam.js';

function patchFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // 1. Add filterListByCourse and populateCourseFilter
    const customLogic = `
function filterListByCourse() {
    window.isViewAllPages = true; // Automatically view all when filtering
    renderExamTable();
}

function populateCourseFilter() {
    const courseSelect = document.getElementById('courseFilter');
    if (!courseSelect) return;
    
    const courseSet = new Set();
    exams.forEach(e => {
        if (e.subject) courseSet.add(e.subject);
    });
    
    const currentVal = courseSelect.value;
    courseSelect.innerHTML = '<option value="ALL">전체보기</option>';
    
    const sortedCourses = Array.from(courseSet).sort();
    sortedCourses.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.textContent = c;
        courseSelect.appendChild(option);
    });
    
    if (sortedCourses.includes(currentVal)) {
        courseSelect.value = currentVal;
    }
}
`;

    // Append to end if not exists
    if (!content.includes('function filterListByCourse()')) {
        content += '\n' + customLogic;
    }
    
    // 2. Call populateCourseFilter() when data loads
    // Find the end of the DOMContentLoaded listener where exams are loaded
    content = content.replace('renderExamTable();\n\n    document.getElementById(\'btnAddNew\').addEventListener(\'click\', openStudentModal);', 
        'populateCourseFilter();\n    renderExamTable();\n\n    document.getElementById(\'btnAddNew\').addEventListener(\'click\', openStudentModal);');

    // 3. Update renderExamTable to filter by course
    const filterStart = `        const filteredData = realDataWithIndex.filter(exam => {`;
    const newFilterStart = `        const courseFilter = document.getElementById('courseFilter') ? document.getElementById('courseFilter').value : 'ALL';
        
        const filteredData = realDataWithIndex.filter(exam => {
            if (courseFilter !== 'ALL') {
                if (!exam.subject || exam.subject !== courseFilter) return false;
            }`;
    content = content.replace(filterStart, newFilterStart);

    // 4. Remove old toggleViewAllPages button logic if it's there, but not strictly necessary to delete it. Let's just leave it or overwrite `isViewAllPages` logic.
    // If we want "전체보기" to just show all pages unconditionally:
    const pageLogic = `const rowsPerPage = window.isViewAllPages ? Math.max(filteredData.length, 15) : 15;`;
    const newPageLogic = `window.isViewAllPages = true; // Always view all pages with this new layout
        const rowsPerPage = window.isViewAllPages ? Math.max(filteredData.length, 15) : 15;`;
    content = content.replace(pageLogic, newPageLogic);

    fs.writeFileSync(file, content, 'utf8');
}

patchFile(path1);
patchFile(path2);
console.log('Patched exam js files!');
