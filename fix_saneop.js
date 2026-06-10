const fs = require('fs');

// 1. sheet.html 수정
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');
content = content.replace(/var isBogeoCourse = rowCourseNameScope && rowCourseNameScope\.replace\(\/\\s\/g, ''\)\.includes\('복어'\);/g, 
  "var isBogeoCourse = rowCourseNameScope && (rowCourseNameScope.replace(/\\s/g, '').includes('복어') || rowCourseNameScope.replace(/\\s/g, '').includes('산업기사'));");
fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);

// 2. shared_calc.js 수정
let shared = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');
shared = shared.replace(/let isBogeoCourse = String\(courseFilter \|\| ''\)\.includes\('복어'\);/g,
  "let isBogeoCourse = String(courseFilter || '').includes('복어') || String(courseFilter || '').includes('산업기사');");
fs.writeFileSync('Sejong/SejongAttendance/public/shared_calc.js', shared);

// 3. tuition_v4.js targetCount 수정
let tuition = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v4.js', 'utf8');
const oldTarget = `const isDualBakeryLocal = (courseNameOnly && courseNameOnly.replace(/\\s/g, '').includes('제과제빵')) || (!courseNameOnly && localFinalCourse && localFinalCourse.replace(/\\s/g, '').includes('제과제빵'));
                const targetCount = isDualBakeryLocal ? 17 : 9;`;

const newTarget = `const isDualBakeryLocal = (courseNameOnly && courseNameOnly.replace(/\\s/g, '').includes('제과제빵')) || (!courseNameOnly && localFinalCourse && localFinalCourse.replace(/\\s/g, '').includes('제과제빵'));
                const isBogeoLocal = (courseNameOnly && (courseNameOnly.replace(/\\s/g, '').includes('복어') || courseNameOnly.replace(/\\s/g, '').includes('산업기사'))) || (!courseNameOnly && localFinalCourse && (localFinalCourse.replace(/\\s/g, '').includes('복어') || localFinalCourse.replace(/\\s/g, '').includes('산업기사')));
                
                const cycleSettings = typeof getCycleSettings === 'function' ? getCycleSettings() : { default: 9, dual: 17, bogeo: 10 };
                let targetCount = cycleSettings.default;
                if (isBogeoLocal) {
                    targetCount = cycleSettings.bogeo;
                } else if (isDualBakeryLocal) {
                    targetCount = cycleSettings.dual;
                }`;
tuition = tuition.replace(oldTarget, newTarget);
fs.writeFileSync('Sejong/SejongAttendance/public/tuition_v4.js', tuition);

// 배포 폴더 복사
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');
execSync('cp Sejong/SejongAttendance/public/shared_calc.js public/sejong/shared_calc.js');
execSync('cp Sejong/SejongAttendance/public/tuition_v4.js public/sejong/tuition_v4.js');

