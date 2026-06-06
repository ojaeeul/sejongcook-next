const fs = require('fs');

function fixProgress(path) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');

    // Replace:
    // courseProgressList.push({ name: courseNameOnly, count: currentProgressObj.count, target: currentProgressObj.target });
    // With dynamic subtraction logic

    const replaceTarget = `
                let displayCount = currentProgressObj.count;
                let isDualLocal = (courseNameOnly && courseNameOnly.replace(/\\s/g, '').includes('제과제빵')) || (!courseNameOnly && m.course && m.course.replace(/\\s/g, '').includes('제과제빵'));
                let displayTarget = isDualLocal ? 17 : 9;
                
                let vRaw = Math.round(displayCount * 10);
                let cycleCount = 0;
                if (isDualLocal) {
                    if (vRaw >= 170) cycleCount = Math.floor((vRaw - 170) / 160) + 1;
                    displayCount = displayCount - (cycleCount * 16);
                } else {
                    if (vRaw >= 90) cycleCount = Math.floor((vRaw - 90) / 80) + 1;
                    displayCount = displayCount - (cycleCount * 8);
                }
                
                courseProgressList.push({ name: courseNameOnly, count: displayCount, target: displayTarget });
    `;

    content = content.replace(/courseProgressList\.push\(\{ name: courseNameOnly, count: currentProgressObj\.count, target: currentProgressObj\.target \}\);/g, replaceTarget);

    fs.writeFileSync(path, content, 'utf8');
}

fixProgress('public/sejong/tuition_v3.js');
fixProgress('public/sejong/tuition_v4.js');
console.log('Progress patched');
