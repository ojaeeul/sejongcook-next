const fs = require('fs');

function fixTuitionFile(path) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');

    content = content.replace(/let currentProgressObj = stats \? stats\.currentCount : \{ count: 0, target: 9 \};/g, 
        'let currentProgressObj = stats && stats.currentCount ? stats.currentCount : { count: 0, target: 9 };');

    const searchTarget = `const targetCount = isDualBakeryLocal ? 17 : 9;
                
                
                
                let remainingForLoop = currentProgressObj.count;

                stats.allMilestones.forEach(ms => {
                    let currentTargetCount = targetCount;`;

    const replaceTarget = `const firstTargetCount = isDualBakeryLocal ? 17 : 9;
                const subTargetCount = isDualBakeryLocal ? 16 : 8;
                let isFirstCycleForThisCourse = true;
                let remainingForLoop = currentProgressObj.count;
                stats.allMilestones.forEach(ms => {
                    let currentTargetCount = isFirstCycleForThisCourse ? firstTargetCount : subTargetCount;`;

    content = content.replace(searchTarget, replaceTarget);

    // Some replacements may fail if format doesn't match exactly. Let's do it simply using replace regex.
    content = content.replace(/const targetCount = isDualBakeryLocal \? 17 : 9;\s*let remainingForLoop = currentProgressObj\.count;\s*stats\.allMilestones\.forEach\(ms => \{\s*let currentTargetCount = targetCount;/g, replaceTarget);

    content = content.replace(/remainingForLoop \-= currentTargetCount;/g, `remainingForLoop -= currentTargetCount;
                            isFirstCycleForThisCourse = false;`);

    // In courseProgressList, if we have currentProgressObj.count as TOTAL attendance,
    // we should format it as PROGRESS within cycle, as tuition_v3_old.js did in getProgressInfo.
    
    fs.writeFileSync(path, content, 'utf8');
}

fixTuitionFile('public/sejong/tuition_v3.js');
fixTuitionFile('public/sejong/tuition_v4.js');
console.log('Tuition files patched');
