const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
    /if \(courseNameScope && courseNameScope\.includes\(rule\.keyword\)\) {\s*trigger = rule\.cycle;\s*matched = true;\s*break;\s*}/g,
    `if (courseNameScope && courseNameScope.includes(rule.keyword)) {
                if (memberType === 'student' && rule.cycle_student !== undefined) {
                    trigger = rule.cycle_student;
                } else {
                    trigger = rule.cycle;
                }
                matched = true;
                break;
            }`
);

fs.writeFileSync(file, content);
