const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf8');

const targetStr = `                            let vRaw = Math.round(runningTotal * 10);
                            let limit = isDualCourse ? 16.0 : 8.0;
                            let trigger = isDualCourse ? 17.0 : 9.0;
                            let limitRaw = Math.round(limit * 10);
                            let triggerRaw = Math.round(trigger * 10);`;

const replacementStr = `                            const settings = getCycleSettings();
                            let limit, trigger;
                            if (isBogeoCourse) {
                                trigger = settings.bogeo;
                                limit = settings.bogeo - 1.0;
                            } else if (isDualCourse) {
                                trigger = settings.dual;
                                limit = settings.dual - 1.0;
                            } else {
                                trigger = settings.default;
                                limit = settings.default - 1.0;
                            }

                            let vRaw = Math.round(runningTotal * 10);
                            let limitRaw = Math.round(limit * 10);
                            let triggerRaw = Math.round(trigger * 10);`;

content = content.replace(targetStr, replacementStr);

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
const { execSync } = require('child_process');
execSync('cp Sejong/SejongAttendance/public/sheet.html public/sejong/sheet.html');
