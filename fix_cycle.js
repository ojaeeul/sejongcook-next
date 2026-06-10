const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

const target = `    const getCycle = (val) => {
        let vRaw = Math.round(val * 10);
        if (isBogeoCourse) {
            let target = 17 * 10; // Bogeo default
            if (vRaw < target) return 0;
            return Math.floor((vRaw - target) / (target - 10)) + 1;
        } else if (isDualCourse) {
            let target = 17 * 10; // Dual default
            if (vRaw < target) return 0;
            return Math.floor((vRaw - target) / (target - 10)) + 1;
        } else {
            let target = 9 * 10; // Standard default
            if (vRaw < target) return 0;
            return Math.floor((vRaw - target) / (target - 10)) + 1;
        }
    };`;

const replacement = `    const getCycleSettings = () => {
        let defaultVal = 9;
        let dualVal = 17;
        let bogeoVal = 17;
        if (typeof document !== 'undefined') {
            const sd = document.getElementById('cycleStandard');
            const dd = document.getElementById('cycleDual');
            const bd = document.getElementById('cycleBogeo');
            if (sd) defaultVal = parseFloat(sd.value) || 9;
            if (dd) dualVal = parseFloat(dd.value) || 17;
            if (bd) bogeoVal = parseFloat(bd.value) || 17;
        }
        return { default: defaultVal, dual: dualVal, bogeo: bogeoVal };
    };

    const getCycle = (val) => {
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

content = content.replace(target, replacement);

fs.writeFileSync('Sejong/SejongAttendance/public/shared_calc.js', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/shared_calc.js public/sejong/shared_calc.js');
