const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

const targetFunc = `let sejongCycleSettingsCache = null;
function getCycleSettings() {
    if (!sejongCycleSettingsCache) {
        sejongCycleSettingsCache = { default: 9, dual: 17, bogeo: 10 };
        try {
            const saved = localStorage.getItem("sejong_redbox_cycles");
            if (saved) {
                sejongCycleSettingsCache = { ...sejongCycleSettingsCache, ...JSON.parse(saved) };
            }
        } catch(e) {}
    }
    return sejongCycleSettingsCache;
}`;

const replacementFunc = `function getCycleSettings() {
    let defaultVal = 9;
    let dualVal = 17;
    let bogeoVal = 17; // Changed from 10 to 17 to match sheet.html
    
    if (typeof document !== 'undefined') {
        const sd = document.getElementById('cycleStandard');
        const dd = document.getElementById('cycleDual');
        const bd = document.getElementById('cycleBogeo');
        if (sd) defaultVal = parseFloat(sd.value) || 9;
        if (dd) dualVal = parseFloat(dd.value) || 17;
        if (bd) bogeoVal = parseFloat(bd.value) || 17;
    }
    return { default: defaultVal, dual: dualVal, bogeo: bogeoVal };
}`;

content = content.replace(targetFunc, replacementFunc);

// Bump version cache
let sheetContent = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');
sheetContent = sheetContent.replace(/v=202606110743/g, 'v=202606110800');

fs.writeFileSync('Sejong/SejongAttendance/public/shared_calc.js', content);
fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', sheetContent);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/shared_calc.js public/sejong/shared_calc.js');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');
