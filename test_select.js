const m = { id: 1770517017920, course: "양식기능사(17:00)", phone: "010-1234-5678", name: "김삼이" };
const rangeStart = new Date(2026, 0, 7, 0, 0, 0);
const rangeEnd = new Date(2026, 0, 7, 23, 59, 59);

const syncData = {
    "1770517017920_2026_1_양식기능사(17:00)": ["2026-01-07"]
};

function getAllMilestonesForRange(memberId, courseFilter, startRange, endRange) {
    const cleanFilter = String(courseFilter || 'all').replace(/\([^)]*\)/g, '').trim();
    let matched = [];
    let current = new Date(startRange);
    while (current <= endRange) {
        const y = current.getFullYear();
        const m = current.getMonth() + 1;
        const d = current.getDate();

        Object.keys(syncData).forEach(k => {
            const parts = k.split('_'); 
            if (parts.length >= 4 && parts[0] == memberId && parts[1] == y && parts[2] == m) {
                const courseName = parts[3];
                if (cleanFilter !== 'all' && courseName !== 'all' && !courseName.includes(cleanFilter)) {
                    return;
                }
                const days = syncData[k];
                let hasRedBoxOnDay = false;
                
                const normalizeDay = (val) => {
                    return String(val).includes('-') ? parseInt(String(val).split('-')[2], 10) : parseInt(val, 10);
                };

                if (Array.isArray(days)) {
                    hasRedBoxOnDay = days.some(dVal => normalizeDay(dVal) === d);
                } else if (days !== null && days !== undefined) {
                    hasRedBoxOnDay = (normalizeDay(days) === d);
                }
                
                if (hasRedBoxOnDay) {
                    matched.push({ year: y, month: m, day: d, course: courseName === 'all' ? null : courseName });
                }
            }
        });
        current.setDate(current.getDate() + 1);
    }
    return matched;
}

const schedArr = getAllMilestonesForRange(m.id, "양식기능사", rangeStart, rangeEnd);
console.log("schedArr:", schedArr);

