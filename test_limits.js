const fs = require('fs');

global.window = {};
global.window.sejongCycleRules = {
    default: 9,
    custom: [
        { keyword: "일식기능사", cycle: 10, cycle_student: 9 }
    ]
};

const code = fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

eval(code);

console.log("General:", window.getCourseLimits("일식기능사", "general"));
console.log("Student:", window.getCourseLimits("일식기능사", "student"));
console.log("Undefined Type:", window.getCourseLimits("일식기능사"));

