const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sheet.html';
let content = fs.readFileSync(file, 'utf8');

// Find the usage of global_attendance_cutoffs
let search = `                            let maxP = (window.global_attendance_cutoffs && window.global_attendance_cutoffs[safeCourseKey] !== undefined)
                                ? window.global_attendance_cutoffs[safeCourseKey]
                                : (safeCourseKey.includes("제과제빵") ? 16 : 8);`;
let replace = `                            let maxP = (window.global_attendance_cutoffs && window.global_attendance_cutoffs[safeCourseKey] !== undefined)
                                ? window.global_attendance_cutoffs[safeCourseKey]
                                : (safeCourseKey.includes("제과제빵") ? 16 : 8);
                            if (currentMember && currentMember.type === 'student' && window.global_attendance_cutoffs_student && window.global_attendance_cutoffs_student[safeCourseKey] !== undefined) {
                                maxP = window.global_attendance_cutoffs_student[safeCourseKey];
                            }`;
content = content.replace(search, replace);

fs.writeFileSync(file, content);
