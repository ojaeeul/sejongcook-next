const fs = require('fs');

let tuition = fs.readFileSync('Sejong/SejongAttendance/public/tuition_v4.js', 'utf8');

const oldMath = `                let vRaw = Math.round(displayCount * 10);
                let cycleCount = 0;
                if (isDualLocal) {
                    if (vRaw >= 170) cycleCount = Math.floor((vRaw - 170) / 160) + 1;
                    displayCount = displayCount - (cycleCount * 16);
                } else {
                    if (vRaw >= 90) cycleCount = Math.floor((vRaw - 90) / 80) + 1;
                    displayCount = displayCount - (cycleCount * 8);
                }`;

const newMath = `                let vRaw = Math.round(displayCount * 10);
                let cycleCount = 0;
                const cSettings = typeof getCycleSettings === 'function' ? getCycleSettings() : { default: 9, dual: 17, bogeo: 10 };
                
                const isBogeoLocal = (courseNameOnly && (courseNameOnly.replace(/\\s/g, '').includes('복어') || courseNameOnly.replace(/\\s/g, '').includes('산업기사'))) || (!courseNameOnly && localFinalCourse && (localFinalCourse.replace(/\\s/g, '').includes('복어') || localFinalCourse.replace(/\\s/g, '').includes('산업기사')));
                
                if (isBogeoLocal) {
                    let trigger = cSettings.bogeo * 10;
                    let limit = trigger - 10;
                    if (vRaw >= trigger) cycleCount = Math.floor((vRaw - trigger) / limit) + 1;
                    displayCount = displayCount - (cycleCount * (limit / 10));
                } else if (isDualLocal) {
                    let trigger = cSettings.dual * 10;
                    let limit = trigger - 10;
                    if (vRaw >= trigger) cycleCount = Math.floor((vRaw - trigger) / limit) + 1;
                    displayCount = displayCount - (cycleCount * (limit / 10));
                } else {
                    let trigger = cSettings.default * 10;
                    let limit = trigger - 10;
                    if (vRaw >= trigger) cycleCount = Math.floor((vRaw - trigger) / limit) + 1;
                    displayCount = displayCount - (cycleCount * (limit / 10));
                }`;

tuition = tuition.replace(oldMath, newMath);
fs.writeFileSync('Sejong/SejongAttendance/public/tuition_v4.js', tuition);

const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/tuition_v4.js public/sejong/tuition_v4.js');

