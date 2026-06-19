const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/course_time_admin.html';
let content = fs.readFileSync(file, 'utf8');

// Declare global vars
content = content.replace('let makeupCutoffs = {};\n        let attendanceCutoffs = {};', 'let makeupCutoffs = {};\n        let attendanceCutoffs = {};\n        let makeupCutoffs_student = {};\n        let attendanceCutoffs_student = {};');

// Load settings
content = content.replace('makeupCutoffs = settings.makeupCutoffs || {};\n                attendanceCutoffs = settings.attendanceCutoffs || {};', 'makeupCutoffs = settings.makeupCutoffs || {};\n                attendanceCutoffs = settings.attendanceCutoffs || {};\n                makeupCutoffs_student = settings.makeupCutoffs_student || {};\n                attendanceCutoffs_student = settings.attendanceCutoffs_student || {};');

// Render makeupCutoffs
content = content.replace(/const val = makeupCutoffs\[course\];/g, 'const val = makeupCutoffs[course];\n                const valStu = makeupCutoffs_student[course] !== undefined ? makeupCutoffs_student[course] : val;');
content = content.replace(/<input type="number" value="\${val}" style="width: 36px; border: none; outline: none; text-align: center; font-size: 0\.95rem; font-weight: bold; color: #b45309; background: transparent;" onchange="updateCutoff\('\${course}', this\.value\)">/g, 
`일반 <input type="number" value="\${val}" style="width: 36px; border: none; outline: none; text-align: center; font-size: 0.95rem; font-weight: bold; color: #b45309; background: transparent;" onchange="updateCutoff('\${course}', this.value, 'general')">
                        <span style="color: #d97706; font-size: 0.85rem; margin-left: 2px; font-weight: 500;">회</span>
                        <span style="color:#fde68a; margin: 0 4px;">|</span>
                        학생 <input type="number" value="\${valStu}" style="width: 36px; border: none; outline: none; text-align: center; font-size: 0.95rem; font-weight: bold; color: #b45309; background: transparent;" onchange="updateCutoff('\${course}', this.value, 'student')">`);

// Update makeup function
content = content.replace(/window\.updateCutoff = function\(course, val\) {[\s\S]*?};/, `window.updateCutoff = function(course, val, type = 'general') {
            const num = Number(val);
            if (!isNaN(num) && num > 0) {
                if (type === 'student') makeupCutoffs_student[course] = num;
                else makeupCutoffs[course] = num;
                saveSettings();
            }
        };`);

// Render attendanceCutoffs
content = content.replace(/const val = attendanceCutoffs\[course\];/g, 'const val = attendanceCutoffs[course];\n                const valStu = attendanceCutoffs_student[course] !== undefined ? attendanceCutoffs_student[course] : val;');
content = content.replace(/<input type="number" value="\${val}" style="width: 36px; border: none; outline: none; text-align: center; font-size: 0\.95rem; font-weight: bold; color: #1d4ed8; background: transparent;" onchange="updateAttendanceCutoff\('\${course}', this\.value\)">/g,
`일반 <input type="number" value="\${val}" style="width: 36px; border: none; outline: none; text-align: center; font-size: 0.95rem; font-weight: bold; color: #1d4ed8; background: transparent;" onchange="updateAttendanceCutoff('\${course}', this.value, 'general')">
                        <span style="color: #2563eb; font-size: 0.85rem; margin-left: 2px; font-weight: 500;">회</span>
                        <span style="color:#bfdbfe; margin: 0 4px;">|</span>
                        학생 <input type="number" value="\${valStu}" style="width: 36px; border: none; outline: none; text-align: center; font-size: 0.95rem; font-weight: bold; color: #1d4ed8; background: transparent;" onchange="updateAttendanceCutoff('\${course}', this.value, 'student')">`);

// Update attendance function
content = content.replace(/window\.updateAttendanceCutoff = function\(course, val\) {[\s\S]*?};/, `window.updateAttendanceCutoff = function(course, val, type = 'general') {
            const num = Number(val);
            if (!isNaN(num) && num > 0) {
                if (type === 'student') attendanceCutoffs_student[course] = num;
                else attendanceCutoffs[course] = num;
                saveSettings();
            }
        };`);

// Save Settings
content = content.replace('settingsObj.attendanceCutoffs = attendanceCutoffs;', 'settingsObj.attendanceCutoffs = attendanceCutoffs;\n                settingsObj.makeupCutoffs_student = makeupCutoffs_student;\n                settingsObj.attendanceCutoffs_student = attendanceCutoffs_student;');

// Initialize 일식 and 중식 with defaults
let initSearch = 'courses = settings.courses && settings.courses.length > 0 ? settings.courses : [...DEFAULT_COURSES];';
let initReplace = `courses = settings.courses && settings.courses.length > 0 ? settings.courses : [...DEFAULT_COURSES];
                if (makeupCutoffs['일식기능사'] === undefined) { makeupCutoffs['일식기능사'] = 9; makeupCutoffs_student['일식기능사'] = 8; }
                if (makeupCutoffs['중식기능사'] === undefined) { makeupCutoffs['중식기능사'] = 9; makeupCutoffs_student['중식기능사'] = 8; }
                if (attendanceCutoffs['일식기능사'] === undefined) { attendanceCutoffs['일식기능사'] = 9; attendanceCutoffs_student['일식기능사'] = 8; }
                if (attendanceCutoffs['중식기능사'] === undefined) { attendanceCutoffs['중식기능사'] = 9; attendanceCutoffs_student['중식기능사'] = 8; }`;
content = content.replace(initSearch, initReplace);

fs.writeFileSync(file, content);
