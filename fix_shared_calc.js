const fs = require('fs');
let content = fs.readFileSync('public/sejong/shared_calc.js', 'utf8');

// The problematic block:
//                let newCycle = getCycle(runningTotal);
//                if (isNaN(newCycle)) newCycle = 0;
//
//                let currentCycle = getCycle(currentMC.carryFromPrev);
//                if (isNaN(currentCycle)) currentCycle = 0;
//                let shouldShowRedBox = false;

const fixBlock = `
        let currentCycleForMonth = getCycle(currentMC.carryFromPrev);
        if (isNaN(currentCycleForMonth)) currentCycleForMonth = 0;
        const adjustment = GLOBAL_DATA_ADJUSTMENTS[String(member.id)]?.[currentMC.key];

        currentMonthLogs.forEach(l => {`;

content = content.replace(/const adjustment = GLOBAL_DATA_ADJUSTMENTS\[String\(member\.id\)\]\?\.\[currentMC\.key\];\s*currentMonthLogs\.forEach\(l => \{/, fixBlock);

const fixLoop = `
                let newCycle = getCycle(runningTotal);
                if (isNaN(newCycle)) newCycle = 0;

                let shouldShowRedBox = false;
                if (newCycle > currentCycleForMonth) {
                    shouldShowRedBox = true;
                    currentCycleForMonth = newCycle;
                }`;

content = content.replace(/let newCycle = getCycle\(runningTotal\);\s*if \(isNaN\(newCycle\)\) newCycle = 0;\s*let currentCycle = getCycle\(currentMC\.carryFromPrev\);\s*if \(isNaN\(currentCycle\)\) currentCycle = 0;\s*let shouldShowRedBox = false;\s*if \(newCycle > currentCycle\) \{\s*shouldShowRedBox = true;\s*currentCycle = newCycle;\s*\}/, fixLoop);

fs.writeFileSync('public/sejong/shared_calc.js', content, 'utf8');
