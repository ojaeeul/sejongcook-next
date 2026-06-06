const fs = require('fs');
let content = fs.readFileSync('public/sejong/tuition_v3.js', 'utf8');

const target = `            if (syncData[sKey] && Array.isArray(syncData[sKey]) && syncData[sKey].length > 0) rDay = syncData[sKey];
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
            }`;

const replacement = `            if (syncData[sKey] && Array.isArray(syncData[sKey]) && syncData[sKey].length > 0) rDay = syncData[sKey];
            
            if (rDay) {
                // Clear internal miscalculated real milestones for this month
                const idx = allMilestones.findIndex(ms => ms.year === sYear && ms.month === sMonth);
                if (idx >= 0) allMilestones.splice(idx, 1);
                
                rDay.forEach(d => {
                    allMilestones.push({ year: sYear, month: sMonth, day: d, isSimulated: false });
                });
                return { type: 'real' };
            }`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync('public/sejong/tuition_v3.js', content, 'utf8');
    fs.writeFileSync('Sejong/public/tuition_v3.js', content, 'utf8');
    console.log("Fixed tuition_v3.js to ignore sSimKey");
} else {
    console.log("Target not found!");
}
