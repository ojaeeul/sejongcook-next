const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const examJsPath = basePath + 'exam.js';
const practicalExamJsPath = basePath + 'practical_exam.js';

function fixExamJs() {
    let content = fs.readFileSync(examJsPath, 'utf8');
    const newFunc = `function populateCourseFilter() {
    const courseSelect = document.getElementById('courseFilter');
    if (!courseSelect) return;
    
    const currentVal = courseSelect.value;
    const sortedCourses = ['제과기능사', '제빵기능사', '제과제빵기능사', '산업기사', '기능장', '기타'];
    courseSelect.innerHTML = '<option value="ALL">전체보기</option>';
    
    sortedCourses.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.textContent = c;
        courseSelect.appendChild(option);
    });
    
    if (sortedCourses.includes(currentVal)) {
        courseSelect.value = currentVal;
    }
}`;
    
    // Replace the old function
    const regex = /function populateCourseFilter\(\) \{[\s\S]*?(?=\nfunction |\n\/\/|\n*$)/;
    // Wait, regex might fail if there's no function after it. Let's just find and replace the block.
    // It is at the end of the file, let's just replace from "function populateCourseFilter() {" to the end.
    const startIdx = content.indexOf('function populateCourseFilter() {');
    if (startIdx !== -1) {
        content = content.substring(0, startIdx) + newFunc + '\n';
        fs.writeFileSync(examJsPath, content, 'utf8');
    }
}

function fixPracticalExamJs() {
    let content = fs.readFileSync(practicalExamJsPath, 'utf8');
    const newFunc = `function populateCourseFilter() {
    const courseSelect = document.getElementById('courseFilter');
    if (!courseSelect) return;
    
    const currentVal = courseSelect.value;
    const sortedCourses = ['한식기능사', '양식기능사', '일식기능사', '중식기능사', '복어기능사', '산업기사', '기능장', '기타'];
    courseSelect.innerHTML = '<option value="ALL">전체보기</option>';
    
    sortedCourses.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.textContent = c;
        courseSelect.appendChild(option);
    });
    
    if (sortedCourses.includes(currentVal)) {
        courseSelect.value = currentVal;
    }
}`;
    
    const startIdx = content.indexOf('function populateCourseFilter() {');
    if (startIdx !== -1) {
        content = content.substring(0, startIdx) + newFunc + '\n';
        fs.writeFileSync(practicalExamJsPath, content, 'utf8');
    }
}

fixExamJs();
fixPracticalExamJs();

console.log('Fixed JS dropdown populations.');
