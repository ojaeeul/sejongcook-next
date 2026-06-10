const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

const target1 = `            let currentAttendanceIncrement = attendanceIncrement;
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

const replacement1 = `            let currentAttendanceIncrement = attendanceIncrement;

            if (isMakeupMarker) manualMakeup += currentAttendanceIncrement;

            if (isRegularAttendance) {
                attendances += currentAttendanceIncrement;
            }

            if (isRegularAttendance || isMakeupMarker) {
                const prevNet = globalRunningTotal;
                globalRunningTotal += currentAttendanceIncrement;`;

content = content.replace(target1, replacement1);

const target2 = `            let currentAttendanceIncrement = attendanceIncrement;
            let numericValue = parseFloat(l.status);
            if (!isNaN(numericValue) && numericValue > 0) {
                currentAttendanceIncrement = numericValue;
            }

            if (isRegularAttendance || isMakeupMarker) {
                runningTotal += currentAttendanceIncrement;`;

const replacement2 = `            let currentAttendanceIncrement = attendanceIncrement;

            if (isRegularAttendance || isMakeupMarker) {
                runningTotal += currentAttendanceIncrement;`;

content = content.replace(target2, replacement2);

fs.writeFileSync('Sejong/SejongAttendance/public/shared_calc.js', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/shared_calc.js public/sejong/shared_calc.js');
