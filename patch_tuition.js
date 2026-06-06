const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v3.js', 'utf8');

const targetStr = `        const syncData = JSON.parse(localStorage.getItem('sejong_ledger_sync') || '{}');
        const syncKey = \`\${memberId}_\${year}_\${month}_\${courseFilter || 'all'}\`;

        if (syncData[syncKey] && (!Array.isArray(syncData[syncKey]) || syncData[syncKey].length > 0)) {
            const dayNum = syncData[syncKey];
            eighthDay = { year, month, day: dayNum };
        } else {
            // [추가] 만약 당월 예정일이 없더라도, 익월(M+1) 예정일이 싱크되어 있다면 가져오기 (미리계산 표시용)
            const nextM = month === 12 ? 1 : month + 1;
            const nextY = month === 12 ? year + 1 : year;
            const nextKey = \`\${memberId}_\${nextY}_\${nextM}_\${courseFilter || 'all'}\`;
            if (syncData[nextKey] && !nextEighthDay) {
                nextEighthDay = { year: nextY, month: nextM, day: syncData[nextKey] };
            }
        }

        // 모든 과거 및 현재 동기화된 마일스톤을 allMilestones에 주입
        Object.keys(syncData).forEach(key => {
            const parts = key.split('_');
            if (parts.length >= 4) {
                const sMemberId = parts[0];
                const sYear = parseInt(parts[1], 10);
                const sMonth = parseInt(parts[2], 10);
                const sCourse = parts.slice(3).join('_');
                
                if (sMemberId == memberId && (sCourse === (courseFilter || 'all'))) {
                    if (sYear < year || (sYear === year && sMonth <= month + 1)) {
                        const sDay = syncData[key];
                        if (!allMilestones.some(ms => ms.year === sYear && ms.month === sMonth)) {
                            allMilestones.push({ year: sYear, month: sMonth, day: sDay });
                        }
                    }
                }
            }
        });`;

const replacement = `        const syncData = JSON.parse(localStorage.getItem('sejong_ledger_sync') || '{}');
        
        const applySync = (sYear, sMonth) => {
            const sKey = \`\${memberId}_\${sYear}_\${sMonth}_\${courseFilter || 'all'}\`;
            const sSimKey = sKey + '_simulated';
            let rDay = null;
            let sDay = null;
            
            if (syncData[sKey] && Array.isArray(syncData[sKey]) && syncData[sKey].length > 0) rDay = syncData[sKey];
            if (syncData[sSimKey] && Array.isArray(syncData[sSimKey]) && syncData[sSimKey].length > 0) sDay = syncData[sSimKey];
            
            if (rDay) {
                // Clear internal miscalculated real milestones for this month
                const idx = allMilestones.findIndex(ms => ms.year === sYear && ms.month === sMonth);
                if (idx >= 0) allMilestones.splice(idx, 1);
                
                rDay.forEach(d => {
                    allMilestones.push({ year: sYear, month: sMonth, day: d, isSimulated: false });
                });
                return { type: 'real' };
            } else if (sDay) {
                const idx = allMilestones.findIndex(ms => ms.year === sYear && ms.month === sMonth);
                if (idx >= 0) allMilestones.splice(idx, 1);
                return { type: 'sim', dayObj: { year: sYear, month: sMonth, day: sDay, isSimulated: true } };
            }
            return { type: 'none' };
        };

        const resCurrent = applySync(year, month);
        if (resCurrent.type === 'real') {
            eighthDay = null; // No simulated day, real takes precedence
        } else if (resCurrent.type === 'sim') {
            eighthDay = resCurrent.dayObj;
        }
        
        const nextM = month === 12 ? 1 : month + 1;
        const nextY = month === 12 ? year + 1 : year;
        const resNext = applySync(nextY, nextM);
        if (resNext.type === 'real') {
            nextEighthDay = null;
        } else if (resNext.type === 'sim') {
            nextEighthDay = resNext.dayObj;
        }

        // 모든 과거 동기화된 마일스톤(Real)을 allMilestones에 주입 (단, 현재/다음달 제외)
        Object.keys(syncData).forEach(key => {
            if (key.endsWith('_simulated')) return; // Ignore simulated for past
            const parts = key.split('_');
            if (parts.length >= 4) {
                const sMemberId = parts[0];
                const sYear = parseInt(parts[1], 10);
                const sMonth = parseInt(parts[2], 10);
                const sCourse = parts.slice(3).join('_');
                
                if (sMemberId == memberId && (sCourse === (courseFilter || 'all'))) {
                    // We only care about past months. Current and Next are handled by applySync.
                    if (sYear < year || (sYear === year && sMonth < month)) {
                        const sDay = syncData[key];
                        if (Array.isArray(sDay) && !allMilestones.some(ms => ms.year === sYear && ms.month === sMonth)) {
                            sDay.forEach(d => {
                                allMilestones.push({ year: sYear, month: sMonth, day: d, isSimulated: false });
                            });
                        }
                    }
                }
            }
        });`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replacement);
    fs.writeFileSync('Sejong/SejongAttendance/public/tuition_v3.js', content, 'utf8');
    console.log("Successfully patched tuition_v3.js");
} else {
    console.log("Target string not found in tuition_v3.js");
}
