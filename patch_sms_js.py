import re

with open("public/sejong/sms_v3.js", "r", encoding="utf-8") as f:
    content = f.read()

new_function = """function getMemberAllMilestones(memberId, courseFilter, limitDate = null) {
    let milestones = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    
    const memberObj = allMembers.find(m => String(m.id) === String(memberId));
    if (!memberObj) return [];
    
    // Scan recent past and near future months (e.g. -2 to +2 months from now)
    for (let monthOffset = -2; monthOffset <= 2; monthOffset++) {
        let y = currentYear;
        let m = currentMonth + monthOffset;
        if (m > 12) { m -= 12; y++; }
        if (m < 1) { m += 12; y--; }
        
        const syncKey = `${memberId}_${y}_${m}_${courseFilter || 'all'}`;
        const syncData = window.ledgerSyncData || JSON.parse(localStorage.getItem('sejong_ledger_sync') || '{}');
        
        if (syncData[syncKey]) {
            const rawSync = syncData[syncKey];
            const days = Array.isArray(rawSync) ? rawSync : (typeof rawSync === 'number' ? [rawSync] : []);
            days.forEach(d => milestones.push({ year: y, month: m, day: d }));
            continue;
        }

        if (typeof window.calculateRedBoxesForMonth === 'function') {
            const result = window.calculateRedBoxesForMonth(memberObj, y, m, attendanceData, courseFilter, GLOBAL_DATA_ADJUSTMENTS);
            if (result && result.redDays && result.redDays.length > 0) {
                for (let d of result.redDays) {
                    milestones.push({ year: y, month: m, day: d });
                }
            }
        }
    }
    
    // Sort milestones
    milestones.sort((a, b) => new Date(a.year, a.month - 1, a.day) - new Date(b.year, b.month - 1, b.day));
    
    // Filter out past milestones if limitDate is not provided
    // Actually getMemberScheduledDate just gets the first available upcoming or most recent one
    return milestones.filter(m => new Date(m.year, m.month - 1, m.day) >= today.setHours(0,0,0,0));
}"""

start_idx = content.find("function getMemberAllMilestones(memberId, courseFilter, limitDate = null) {")
if start_idx != -1:
    end_idx = content.find("function syncCalendarSelection() {", start_idx)
    if end_idx != -1:
        content = content[:start_idx] + new_function + "\n\n" + content[end_idx:]
        with open("public/sejong/sms_v3.js", "w", encoding="utf-8") as f:
            f.write(content)
        print("Successfully replaced getMemberAllMilestones in sms_v3.js")
    else:
        print("Could not find end of getMemberAllMilestones")
else:
    print("Could not find start of getMemberAllMilestones")
