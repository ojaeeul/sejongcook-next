const fs = require('fs');

// 1. shared_calc.js 수정
let shared = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');
const oldCycle1 = `    const getCycle = (val) => {
        const settings = getCycleSettings();
        let vRaw = Math.round(val * 10);
        if (isBogeoCourse) {
            let target = settings.bogeo * 10;
            if (vRaw < target) return 0;
            return Math.floor((vRaw - target) / target) + 1;
        } else if (isDualCourse) {
            let target = settings.dual * 10;
            if (vRaw < target) return 0;
            return Math.floor((vRaw - target) / target) + 1;
        } else {
            let target = settings.default * 10;
            if (vRaw < target) return 0;
            return Math.floor((vRaw - target) / target) + 1;
        }
    };`;

const newCycle1 = `    const getCycle = (val) => {
        const settings = getCycleSettings();
        let vRaw = Math.round(val * 10);
        if (isBogeoCourse) {
            let target = settings.bogeo * 10;
            if (vRaw < target) return 0;
            return Math.floor((vRaw - target) / (target - 10)) + 1;
        } else if (isDualCourse) {
            let target = settings.dual * 10;
            if (vRaw < target) return 0;
            return Math.floor((vRaw - target) / (target - 10)) + 1;
        } else {
            let target = settings.default * 10;
            if (vRaw < target) return 0;
            return Math.floor((vRaw - target) / (target - 10)) + 1;
        }
    };`;
shared = shared.replace(oldCycle1, newCycle1);
fs.writeFileSync('Sejong/SejongAttendance/public/shared_calc.js', shared);

// 2. sheet.html 수정
let sheet = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');
const oldCycle2 = `                            const getCycle = (val) => {
                                const settings = getCycleSettings();
                                let vRaw = Math.round(val * 10);
                                if (isBogeoCourse) {
                                    let target = settings.bogeo * 10;
                                    if (vRaw < target) return 0;
                                    return Math.floor((vRaw - target) / target) + 1;
                                } else if (isDualCourse) {
                                    let target = settings.dual * 10;
                                    if (vRaw < target) return 0;
                                    return Math.floor((vRaw - target) / target) + 1;
                                } else {
                                    let target = settings.default * 10;
                                    if (vRaw < target) return 0;
                                    return Math.floor((vRaw - target) / target) + 1;
                                }
                            };`;

const newCycle2 = `                            const getCycle = (val) => {
                                const settings = getCycleSettings();
                                let vRaw = Math.round(val * 10);
                                if (isBogeoCourse) {
                                    let target = settings.bogeo * 10;
                                    if (vRaw < target) return 0;
                                    return Math.floor((vRaw - target) / (target - 10)) + 1;
                                } else if (isDualCourse) {
                                    let target = settings.dual * 10;
                                    if (vRaw < target) return 0;
                                    return Math.floor((vRaw - target) / (target - 10)) + 1;
                                } else {
                                    let target = settings.default * 10;
                                    if (vRaw < target) return 0;
                                    return Math.floor((vRaw - target) / (target - 10)) + 1;
                                }
                            };`;
sheet = sheet.replace(oldCycle2, newCycle2);

// 또 다른 getCycle 이 있는지 확인 (맨 위에 정의된 전역 함수)
const oldCycle3 = `            const getCycle = (val, isDualOverride) => {
                const settings = getCycleSettings();
                let vRaw = Math.round(val * 10);
                if (isBogeo) {
                    let target = settings.bogeo * 10;
                    if (vRaw < target) return 0;
                    return Math.floor((vRaw - target) / target) + 1;
                } else if (isDualOverride) {
                    let target = settings.dual * 10;
                    if (vRaw < target) return 0;
                    return Math.floor((vRaw - target) / target) + 1;
                } else {
                    let target = settings.default * 10;
                    if (vRaw < target) return 0;
                    return Math.floor((vRaw - target) / target) + 1;
                }
            };`;

const newCycle3 = `            const getCycle = (val, isDualOverride) => {
                const settings = getCycleSettings();
                let vRaw = Math.round(val * 10);
                if (isBogeo) {
                    let target = settings.bogeo * 10;
                    if (vRaw < target) return 0;
                    return Math.floor((vRaw - target) / (target - 10)) + 1;
                } else if (isDualOverride) {
                    let target = settings.dual * 10;
                    if (vRaw < target) return 0;
                    return Math.floor((vRaw - target) / (target - 10)) + 1;
                } else {
                    let target = settings.default * 10;
                    if (vRaw < target) return 0;
                    return Math.floor((vRaw - target) / (target - 10)) + 1;
                }
            };`;
sheet = sheet.replace(oldCycle3, newCycle3);

// isBogeo = courseFilter.replace(/\s/g, '').includes('복어'); 부분도 산업기사 포함되도록 수정 (만약 안 되어 있다면)
sheet = sheet.replace(/const isBogeo = \(courseFilter && courseFilter\.replace\(\/\\s\/g, ''\)\.includes\('복어'\)\);/g, 
  "const isBogeo = (courseFilter && (courseFilter.replace(/\\s/g, '').includes('복어') || courseFilter.replace(/\\s/g, '').includes('산업기사')));");

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', sheet);

// 배포 폴더 복사
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');
execSync('cp Sejong/SejongAttendance/public/shared_calc.js public/sejong/shared_calc.js');
