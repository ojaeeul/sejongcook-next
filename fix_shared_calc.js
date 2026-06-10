const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/shared_calc.js', 'utf8');

const target = `        // [수정] redBoxDates 계산을 위해 carryOverP는 sheet.html과 동일하게 순수 출석(raw attendances)만 합산해야 함.
        // presentOverride는 화면 표시용이므로 이월(carryOver) 계산에서 제외.
        let rawAttendancesForCarry = attendances;
        
        if (adjustment && adjustment.presentOverride !== undefined) {
            attendances = adjustment.presentOverride; // allMilestones 또는 외부 사용처를 위해 attendances 자체는 남겨둠 (필요시)
        }

        let totalCombined = Math.round((carryOverP + manualMakeup + rawAttendancesForCarry) * 10) / 10;`;

const replacement = `        // [복구] sheet.html과 완전히 동일하게 presentOverride를 적용한 값을 이월(carryOver) 계산에 사용합니다.
        if (adjustment && adjustment.presentOverride !== undefined) {
            attendances = adjustment.presentOverride;
        }

        let totalCombined = Math.round((carryOverP + manualMakeup + attendances) * 10) / 10;`;

content = content.replace(target, replacement);
fs.writeFileSync('Sejong/SejongAttendance/public/shared_calc.js', content);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/shared_calc.js public/sejong/shared_calc.js');

