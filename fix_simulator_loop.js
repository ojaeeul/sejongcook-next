const fs = require('fs');
let content = fs.readFileSync('public/sejong/tuition_v3.js', 'utf8');

const target = `                if (getCycle(currentNetSim, isDualBakery) > prevCycleSim) {
                    if (simDate.getFullYear() === year && (simDate.getMonth() + 1) === month) {
                        foundSimulatedDay = simDate.getDate();
                        eighthMonth = simDate.getMonth() + 1;
                        eighthDay = { year, month, day: foundSimulatedDay };
                        break;
                    }
                    if (simDate > new Date(year, month - 1, 31)) {
                        break;
                    }
                }`;

const replacement = `                if (getCycle(currentNetSim, isDualBakery) > prevCycleSim) {
                    if (typeof futureCycleCount === 'undefined') {
                        global.futureCycleCount = 1;
                    } else {
                        global.futureCycleCount++;
                    }

                    if (simDate.getFullYear() === year && (simDate.getMonth() + 1) === month) {
                        foundSimulatedDay = simDate.getDate();
                        eighthMonth = simDate.getMonth() + 1;
                        eighthDay = { year, month, day: foundSimulatedDay };
                        break;
                    }

                    // 1달(1개의 결제일)만 미리보기 제한 처리 (ledger.js와 동일)
                    if (global.futureCycleCount >= 1 || (typeof futureCycleCount !== 'undefined' && futureCycleCount >= 1)) {
                        break;
                    }
                }`;

if (content.includes(target)) {
    content = content.replace(/let foundSimulatedDay = null;/, 'let foundSimulatedDay = null;\n        let futureCycleCount = 0;');
    content = content.replace(target, replacement.replace(/global\.futureCycleCount/g, 'futureCycleCount').replace(/\|\| \(typeof futureCycleCount !== 'undefined' && futureCycleCount >= 1\)/g, ''));
    fs.writeFileSync('public/sejong/tuition_v3.js', content, 'utf8');
    fs.writeFileSync('Sejong/public/tuition_v3.js', content, 'utf8');
    console.log("Fixed simulator loop in tuition_v3.js to match ledger.js");
} else {
    console.log("Target not found!");
}
