const fs = require('fs');
try {
    const membersData = JSON.parse(fs.readFileSync('./data/sejong/members.json', 'utf8'));
    const attendanceData = JSON.parse(fs.readFileSync('./data/sejong/attendance.json', 'utf8'));

    // Find '을'
    const eul = membersData.find(m => m.name === '을' || m.name.includes('을'));
    if (!eul) {
        console.log("Could not find '을'");
    } else {
        console.log(`Found: ${eul.name} (ID: ${eul.id})`);
        const eulLogs = attendanceData.filter(l => l.memberId === eul.id).sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log(`Logs for ${eul.name} (Total: ${eulLogs.length}):`);

        let byMonth = {};
        eulLogs.forEach(l => {
            if (['present', '10', '12', '2', '5', '7', '[', ']'].includes(l.status) || l.status === 'absent' || l.status.startsWith('X')) {
                const ym = l.date.substring(0, 7);
                if (!byMonth[ym]) byMonth[ym] = 0;
                byMonth[ym]++;
            }
        });
        console.log(byMonth);
    }
} catch (e) {
    console.error(e.message);
}
