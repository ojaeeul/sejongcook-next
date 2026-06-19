const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js';
let content = fs.readFileSync(file, 'utf8');

// Update global variables parsing
let search1 = `if (data && data.makeupCutoffs) {
                window.global_makeup_cutoffs = data.makeupCutoffs;
            }
            if (data && data.attendanceCutoffs) {
                window.global_attendance_cutoffs = data.attendanceCutoffs;
            }`;
let replace1 = `if (data && data.makeupCutoffs) {
                window.global_makeup_cutoffs = data.makeupCutoffs;
                window.global_makeup_cutoffs_student = data.makeupCutoffs_student || {};
            }
            if (data && data.attendanceCutoffs) {
                window.global_attendance_cutoffs = data.attendanceCutoffs;
                window.global_attendance_cutoffs_student = data.attendanceCutoffs_student || {};
            }`;
content = content.replace(search1, replace1);

// Update getCourseLimits
let search2 = `    // 1. 재고출석 커트라인 관리 (Limit 직접 설정, 우선순위 1)
    if (window.global_makeup_cutoffs && window.global_makeup_cutoffs[safeCourseKey] !== undefined) {
        let limit = parseFloat(window.global_makeup_cutoffs[safeCourseKey]);
        return { limit: limit, trigger: limit + 1.0 };
    }`;
let replace2 = `    // 1. 재고출석 커트라인 관리 (Limit 직접 설정, 우선순위 1)
    if (window.global_makeup_cutoffs && window.global_makeup_cutoffs[safeCourseKey] !== undefined) {
        let limit = parseFloat(window.global_makeup_cutoffs[safeCourseKey]);
        if (memberType === 'student' && window.global_makeup_cutoffs_student && window.global_makeup_cutoffs_student[safeCourseKey] !== undefined) {
            limit = parseFloat(window.global_makeup_cutoffs_student[safeCourseKey]);
        }
        return { limit: limit, trigger: limit + 1.0 };
    }`;
content = content.replace(search2, replace2);

fs.writeFileSync(file, content);
