const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf-8');

content = content.replace(
    'window.ledgerSyncData[syncKeyNow] = stats.scheduledDays;',
    `const finalSyncDays = [...stats.scheduledDays];
                        if (stats.scheduledDays.length === 0 && stats.foundSimulatedDay) {
                            finalSyncDays.push(stats.foundSimulatedDay);
                        }
                        window.ledgerSyncData[syncKeyNow] = finalSyncDays;`
);

content = content.replace(
    'window.ledgerSyncData[syncKeyNext] = nextStats.scheduledDays;',
    `const finalSyncDaysNext = [...nextStats.scheduledDays];
                        if (nextStats.scheduledDays.length === 0 && nextStats.foundSimulatedDay) {
                            finalSyncDaysNext.push(nextStats.foundSimulatedDay);
                        }
                        window.ledgerSyncData[syncKeyNext] = finalSyncDaysNext;`
);

fs.writeFileSync('Sejong/SejongAttendance/public/sheet.html', content);
