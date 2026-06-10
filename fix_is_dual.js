const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

const targetStr = `    let isDualCourse = courseFilter === '제과제빵기능사' || courseFilter === 'all';
    let isBogeoCourse = String(courseFilter || '').includes('복어') || String(courseFilter || '').includes('산업기사');
    const courseStr = member.course || '';
    const hasJeggwa = courseStr.includes('제과') && !courseStr.includes('제과제빵');
    const hasJeppang = courseStr.includes('제빵') && !courseStr.includes('제과제빵');
    if (hasJeggwa && hasJeppang && (courseFilter === '제과기능사' || courseFilter === '제빵기능사')) {
        isDualCourse = true;
    }`;

const replacementStr = `    // [HOTFIX] sheet.html과 완벽하게 동일한 조건식 적용
    let cleanFilter = String(courseFilter || '').replace(/\\s/g, '');
    let isDualCourse = cleanFilter.includes('제과제빵');
    let isBogeoCourse = cleanFilter.includes('복어') || cleanFilter.includes('산업기사');
    
    // 혹시라도 개별 과목(제과, 제빵) 두 개를 모두 듣는 특수 경우 (기존 로직 유지하되 안전하게)
    const courseStr = String(member.course || '').replace(/\\s/g, '');
    const hasJeggwa = courseStr.includes('제과') && !courseStr.includes('제과제빵');
    const hasJeppang = courseStr.includes('제빵') && !courseStr.includes('제과제빵');
    if (hasJeggwa && hasJeppang && (cleanFilter.includes('제과기능사') || cleanFilter.includes('제빵기능사'))) {
        isDualCourse = true;
    }`;

content = content.replace(targetStr, replacementStr);

fs.writeFileSync('Sejong/SejongAttendance/public/shared_calc.js', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/shared_calc.js public/sejong/shared_calc.js');
