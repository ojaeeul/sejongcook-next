const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

const regex1 = /const isRegularAttendance = isPresent \|\| isNumericPresent \|\| isAbsent \|\| isEarly \|\| isTardy \|\| isFirstLast;\s*if \(isMakeupMarker\) manualMakeup \+= attendanceIncrement;\s*if \(isRegularAttendance\) {\s*attendances \+= attendanceIncrement;\s*}\s*if \(isRegularAttendance \|\| isMakeupMarker\) {\s*const prevNet = globalRunningTotal;\s*globalRunningTotal \+= attendanceIncrement;/g;

const replacement1 = `const isRegularAttendance = isPresent || isNumericPresent || isAbsent || isEarly || isTardy || isFirstLast;

            let currentAttendanceIncrement = attendanceIncrement;
            let numericValue = parseFloat(l.status);
            if (!isNaN(numericValue) && numericValue > 0) {
                currentAttendanceIncrement = numericValue;
            }

            if (isMakeupMarker) manualMakeup += currentAttendanceIncrement;

            if (isRegularAttendance) {
                attendances += currentAttendanceIncrement;
            }

            if (isRegularAttendance || isMakeupMarker) {
                const prevNet = globalRunningTotal;
                globalRunningTotal += currentAttendanceIncrement;`;

content = content.replace(regex1, replacement1);

const regex2 = /const isRegularAttendance = isPresentExt \|\| isNumericPresent \|\| isAbsent \|\| isEarly \|\| isTardy \|\| isFirstLast;\s*if \(isRegularAttendance \|\| isMakeupMarker\) {\s*runningTotal \+= attendanceIncrement;/g;

const replacement2 = `const isRegularAttendance = isPresentExt || isNumericPresent || isAbsent || isEarly || isTardy || isFirstLast;

            let currentAttendanceIncrement = attendanceIncrement;
            let numericValue = parseFloat(l.status);
            if (!isNaN(numericValue) && numericValue > 0) {
                currentAttendanceIncrement = numericValue;
            }

            if (isRegularAttendance || isMakeupMarker) {
                runningTotal += currentAttendanceIncrement;`;

content = content.replace(regex2, replacement2);

// Fix the third loop for simulated days
const regex3 = /if \(isValidDay && !isHoliday\) {\s*const prevSimCycle = getCycle\(simTotal\);\s*simTotal \+= attendanceIncrement;/g;

const replacement3 = `if (isValidDay && !isHoliday) {
                const prevSimCycle = getCycle(simTotal);
                simTotal += attendanceIncrement; // simulation doesn't know about float overrides`;

content = content.replace(regex3, replacement3);

fs.writeFileSync('Sejong/SejongAttendance/public/shared_calc.js', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/shared_calc.js public/sejong/shared_calc.js');
