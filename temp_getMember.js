function getMemberAllMilestones(memberId, courseFilter, anchorYear = null, anchorMonth = null) {
    let milestones = [];
    const today = new Date();
    const currentYear = anchorYear !== null ? anchorYear : today.getFullYear();
    const currentMonth = anchorMonth !== null ? anchorMonth : today.getMonth() + 1;
    
    const memberObj = allMembers.find(m => String(m.id) === String(memberId));
    if (!memberObj) return [];
    
    // Scan recent past and near future months (e.g. -2 to +2 months from now)
    for (let monthOffset = -2; monthOffset <= 2; monthOffset++) {
        let y = currentYear;
        let m = currentMonth + monthOffset;
        if (m > 12) { m -= 12; y++; }
        if (m < 1) { m += 12; y--; }
        
        if (typeof window.calculateRedBoxesForMonth === 'function') {
            const result = window.calculateRedBoxesForMonth(memberObj, y, m, attendanceData || [], courseFilter, GLOBAL_DATA_ADJUSTMENTS);
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
}
