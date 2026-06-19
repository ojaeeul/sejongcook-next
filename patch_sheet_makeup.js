const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sheet.html';
let content = fs.readFileSync(file, 'utf8');

// Find the usage of global_makeup_cutoffs
let search = `                            let maxJ = (window.global_makeup_cutoffs && window.global_makeup_cutoffs[safeCourseKey] !== undefined)
                                ? window.global_makeup_cutoffs[safeCourseKey]
                                : (safeCourseKey.includes("제과제빵") ? 16 : 8);`;
let replace = `                            let maxJ = (window.global_makeup_cutoffs && window.global_makeup_cutoffs[safeCourseKey] !== undefined)
                                ? window.global_makeup_cutoffs[safeCourseKey]
                                : (safeCourseKey.includes("제과제빵") ? 16 : 8);
                            if (currentMember && currentMember.type === 'student' && window.global_makeup_cutoffs_student && window.global_makeup_cutoffs_student[safeCourseKey] !== undefined) {
                                maxJ = window.global_makeup_cutoffs_student[safeCourseKey];
                            }`;
content = content.replace(search, replace);

fs.writeFileSync(file, content);
