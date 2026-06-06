const fs = require('fs');
const path = 'public/sejong/shared_calc.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Move getCycle up
content = content.replace(/const getCycle = \(val\) => \{[\s\S]*?\};\s*let currentCycle = getCycle\(currentMC\.carryFromPrev\);\s*if \(isNaN\(currentCycle\)\) currentCycle = 0;/, '');

const newCycleLogic = `
    const getCycle = (val) => {
        let vRaw = Math.round(val * 10);
        if (isDualCourse) {
            if (vRaw < 170) return 0;
            return Math.floor((vRaw - 170) / 160) + 1;
        } else {
            if (vRaw < 90) return 0;
            return Math.floor((vRaw - 90) / 80) + 1;
        }
    };

    let globalRunningTotal = 0;
    let globalCurrentCycle = 0;
    let allMilestones = [];
`;

content = content.replace(/let carryOverP = 0;/, newCycleLogic + '\n    let carryOverP = 0;');

// 2. Track milestones inside monthsToCalc.forEach > mLogs.forEach
const oldMLogsForEach = `
            if (isMakeupMarker) manualMakeup += attendanceIncrement;

            if (isRegularAttendance) {
                attendances += attendanceIncrement;
            }
        });`;

const newMLogsForEach = `
            if (isMakeupMarker) manualMakeup += attendanceIncrement;

            if (isRegularAttendance) {
                attendances += attendanceIncrement;
            }

            if (isRegularAttendance || isMakeupMarker) {
                const prevNet = globalRunningTotal;
                globalRunningTotal += attendanceIncrement;
                globalRunningTotal = Math.round(globalRunningTotal * 10) / 10;
                const prevCycle = getCycle(prevNet);
                const currCycle = getCycle(globalRunningTotal);
                
                const dateStr = l.date.split('T')[0];
                const isForced = adjustment && adjustment.forceRedBoxDates && adjustment.forceRedBoxDates.includes(dateStr);
                
                if (currCycle > prevCycle || isForced) {
                    allMilestones.push({ year: mc.year, month: mc.month, day: parseInt(dateStr.split('-')[2], 10), isReal: true });
                }
            }
        });`;
content = content.replace(oldMLogsForEach, newMLogsForEach);

// 3. Return allMilestones and currentCount
const oldReturn = `    return {
        redDays: actualRedDays,
        hasAnyAttendance: hasAnyAttendance,
        isSimulated: true
    };`;

const newReturn = `    return {
        redDays: actualRedDays,
        hasAnyAttendance: hasAnyAttendance,
        isSimulated: true,
        allMilestones: allMilestones,
        currentCount: { count: carryOverP, target: isDualCourse ? 17 : 9 }
    };`;
content = content.replace(oldReturn, newReturn);

// 4. Update the currentMonthLogs cycle tracking to just use the global one? No, it uses currentMC.carryFromPrev.
// Wait, the original currentMonthLogs block relies on `currentCycle`. Let's define `currentCycle` before it.
content = content.replace(/let shouldShowRedBox = false;/g, `let currentCycle = getCycle(currentMC.carryFromPrev);
                if (isNaN(currentCycle)) currentCycle = 0;
                let shouldShowRedBox = false;`);

fs.writeFileSync(path, content, 'utf8');
console.log('shared_calc.js patched');
