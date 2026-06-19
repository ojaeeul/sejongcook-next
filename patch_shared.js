const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js';
let content = fs.readFileSync(file, 'utf8');

let search1 = `window.getCourseCycleLength = function(courseNameScope) {
    let limits = window.getCourseLimits(courseNameScope);`;
let replace1 = `window.getCourseCycleLength = function(courseNameScope, memberType) {
    let limits = window.getCourseLimits(courseNameScope, memberType);`;
content = content.replace(search1, replace1);

let search2 = `window.getCourseLimits = function(courseNameScope) {
    let safeCourseKey = (courseNameScope || '').replace(/\\s/g, '');`;
let replace2 = `window.getCourseLimits = function(courseNameScope, memberType) {
    let safeCourseKey = (courseNameScope || '').replace(/\\s/g, '');`;
content = content.replace(search2, replace2);

let search3 = `    if (window.sejongCycleRules && window.sejongCycleRules.custom) {
        let matched = false;
        for (const rule of window.sejongCycleRules.custom) {
            if (courseNameScope && courseNameScope.includes(rule.keyword)) {
                trigger = rule.cycle;
                matched = true;
                break;
            }
        }
    }`;
let replace3 = `    if (window.sejongCycleRules && window.sejongCycleRules.custom) {
        let matched = false;
        for (const rule of window.sejongCycleRules.custom) {
            if (courseNameScope && courseNameScope.includes(rule.keyword)) {
                if (memberType === 'student' && rule.cycle_student !== undefined) {
                    trigger = rule.cycle_student;
                } else {
                    trigger = rule.cycle;
                }
                matched = true;
                break;
            }
        }
    }`;
content = content.replace(search3, replace3);

let search4 = `        let limits = window.getCourseLimits(courseFilter || String(member.course));`;
let replace4 = `        let limits = window.getCourseLimits(courseFilter || String(member.course), member.type);`;
content = content.replace(search4, replace4);

let search5 = `        currentCount: { count: carryOverP, target: window.getCourseCycleLength(courseFilter || String(member.course)) }`;
let replace5 = `        currentCount: { count: carryOverP, target: window.getCourseCycleLength(courseFilter || String(member.course), member.type) }`;
content = content.replace(search5, replace5);

fs.writeFileSync(file, content);
