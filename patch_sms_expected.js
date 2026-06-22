// Read the file, replace the specific blocks.
const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sms_expected.js', 'utf8');

// Replace in renderRangeCalendar
content = content.replace(
    /const showReal = document\.getElementById\('filterRealPayment'\) \? document\.getElementById\('filterRealPayment'\)\.checked : true;\s*const showSim = document\.getElementById\('filterSimPayment'\) \? document\.getElementById\('filterSimPayment'\)\.checked : false;\s*if \(isSim && !showSim\) return;\s*if \(!isSim && !showReal\) return;\s*const d = String\(dVal\)\.includes\('-'\) \? parseInt\(String\(dVal\)\.split\('-'\)\[2\], 10\) : parseInt\(dVal, 10\);/g,
    `const d = String(dVal).includes('-') ? parseInt(String(dVal).split('-')[2], 10) : parseInt(dVal, 10);
                            let dayIsSim = isSim;
                            if (resultCache && resultCache.allMilestones) {
                                const ms = resultCache.allMilestones.find(x => x.day === d && x.month === (typeof month !== 'undefined' ? month : calendarMonth + 1) && x.year === (typeof year !== 'undefined' ? year : calendarYear));
                                if (ms) dayIsSim = !ms.isReal;
                                else {
                                    const y = typeof year !== 'undefined' ? year : calendarYear;
                                    const m = typeof month !== 'undefined' ? month - 1 : calendarMonth;
                                    const dateObj = new Date(y, m, d);
                                    const today = new Date();
                                    today.setHours(0,0,0,0);
                                    dayIsSim = dateObj > today;
                                }
                            }

                            const showReal = document.getElementById('filterRealPayment') ? document.getElementById('filterRealPayment').checked : true;
                            const showSim = document.getElementById('filterSimPayment') ? document.getElementById('filterSimPayment').checked : false;
                            
                            if (dayIsSim && !showSim) return;
                            if (!dayIsSim && !showReal) return;`
);

// We also need to change the badge pushing logic in getAllMilestonesForRange
content = content.replace(
    /if \(isSim\) {\s*if \(!paymentNamesByDay\[d\]\.sim\.includes\(label\)\) paymentNamesByDay\[d\]\.sim\.push\(label\);\s*} else {\s*if \(!paymentNamesByDay\[d\]\.real\.includes\(label\)\) paymentNamesByDay\[d\]\.real\.push\(label\);\s*}/g,
    `if (typeof dayIsSim !== 'undefined' ? dayIsSim : isSim) {
                        if (!paymentNamesByDay[d].sim.includes(label)) paymentNamesByDay[d].sim.push(label);
                    } else {
                        if (!paymentNamesByDay[d].real.includes(label)) paymentNamesByDay[d].real.push(label);
                    }`
);

fs.writeFileSync('Sejong/SejongAttendance/public/sms_expected.js', content, 'utf8');
