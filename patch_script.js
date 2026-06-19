const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/script.js';
let content = fs.readFileSync(file, 'utf8');

// Declarations
let search1 = `window.global_makeup_cutoffs = {};
window.global_attendance_cutoffs = {};`;
let replace1 = `window.global_makeup_cutoffs = {};
window.global_attendance_cutoffs = {};
window.global_makeup_cutoffs_student = {};
window.global_attendance_cutoffs_student = {};`;
content = content.replace(search1, replace1);

// Assignments
let search2 = `            if (settings.makeupCutoffs) global_makeup_cutoffs = settings.makeupCutoffs;
            if (settings.attendanceCutoffs) global_attendance_cutoffs = settings.attendanceCutoffs;`;
let replace2 = `            if (settings.makeupCutoffs) global_makeup_cutoffs = settings.makeupCutoffs;
            if (settings.attendanceCutoffs) global_attendance_cutoffs = settings.attendanceCutoffs;
            if (settings.makeupCutoffs_student) global_makeup_cutoffs_student = settings.makeupCutoffs_student;
            if (settings.attendanceCutoffs_student) global_attendance_cutoffs_student = settings.attendanceCutoffs_student;`;
content = content.replace(search2, replace2);

fs.writeFileSync(file, content);
