import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to change the early return of syncData to still run calculateRedBoxesForMonth to get simulatedAttendances.
old_sync_logic = """    // 1. Check real milestone
    if (syncData && syncData[syncKey]) {
        const rawSync = syncData[syncKey];
        const days = Array.isArray(rawSync) ? rawSync : (typeof rawSync === 'number' ? [rawSync] : []);
        if (days.length > 0) {
            return { eighthDays: days, eighthMonth: targetMonth, isSimulated: false, hasAnyAttendance: true };
        }
    }

    const m = membersData.find(m => String(m.id) === String(memberId));
        if (typeof window.calculateRedBoxesForMonth === 'function') {
            const memberObj = membersData.find(m => String(m.id) === String(memberId));
            if (memberObj) {
                const result = window.calculateRedBoxesForMonth(memberObj, targetYear, targetMonth, attendanceData || [], courseFilter, window.GLOBAL_DATA_ADJUSTMENTS || {});
                if (result && result.allMilestones && result.allMilestones.length > 0) {
                    const monthMilestones = result.allMilestones.filter(ms => ms.year === targetYear && ms.month === targetMonth);
                    if (monthMilestones.length > 0) {
                        return { milestones: monthMilestones, hasAnyAttendance: result.hasAnyAttendance, simulatedAttendances: result.simulatedAttendances };
                    }
                }
                // fallback to old redDays logic
                if (result && result.redDays && result.redDays.length > 0) {
                    return { eighthDays: result.redDays, eighthMonth: targetMonth, isSimulated: result.isSimulated, hasAnyAttendance: result.hasAnyAttendance, simulatedAttendances: result.simulatedAttendances };
                }
                
                // If there are simulated attendances but no milestone yet (or milestone is in a future month), we still want to return them!
                if (result && result.simulatedAttendances && result.simulatedAttendances.length > 0) {
                     return { eighthDays: [], eighthMonth: targetMonth, isSimulated: result.isSimulated, hasAnyAttendance: result.hasAnyAttendance, simulatedAttendances: result.simulatedAttendances, milestones: [] };
                }
            }
        }
    return { eighthDays: [], eighthMonth: targetMonth, isSimulated: false, hasAnyAttendance: false, milestones: [], simulatedAttendances: [] };"""

new_sync_logic = """    let realEighthDays = [];
    let hasRealFromSync = false;
    
    // 1. Check real milestone
    if (syncData && syncData[syncKey]) {
        const rawSync = syncData[syncKey];
        realEighthDays = Array.isArray(rawSync) ? rawSync : (typeof rawSync === 'number' ? [rawSync] : []);
        if (realEighthDays.length > 0) {
            hasRealFromSync = true;
        }
    }

    const m = membersData.find(m => String(m.id) === String(memberId));
    let simAtts = [];
    let calcHasAny = false;
    let monthMilestones = [];
    let calcEighthDays = [];
    let calcIsSimulated = false;

    if (typeof window.calculateRedBoxesForMonth === 'function') {
        const memberObj = m;
        if (memberObj) {
            const result = window.calculateRedBoxesForMonth(memberObj, targetYear, targetMonth, attendanceData || [], courseFilter, window.GLOBAL_DATA_ADJUSTMENTS || {});
            calcHasAny = result.hasAnyAttendance;
            simAtts = result.simulatedAttendances || [];
            if (result && result.allMilestones && result.allMilestones.length > 0) {
                monthMilestones = result.allMilestones.filter(ms => ms.year === targetYear && ms.month === targetMonth);
            }
            if (result && result.redDays && result.redDays.length > 0) {
                calcEighthDays = result.redDays;
                calcIsSimulated = result.isSimulated;
            }
        }
    }
    
    if (hasRealFromSync) {
        // We have real days from sync, but we also want to return simulated attendances and any simulated milestones
        return { 
            eighthDays: realEighthDays, 
            eighthMonth: targetMonth, 
            isSimulated: false, 
            hasAnyAttendance: true, 
            simulatedAttendances: simAtts,
            milestones: monthMilestones.length > 0 ? monthMilestones : realEighthDays.map(d => ({ year: targetYear, month: targetMonth, day: d, isReal: true }))
        };
    } else {
        if (monthMilestones.length > 0) {
            return { milestones: monthMilestones, hasAnyAttendance: calcHasAny, simulatedAttendances: simAtts };
        }
        if (calcEighthDays.length > 0) {
            return { eighthDays: calcEighthDays, eighthMonth: targetMonth, isSimulated: calcIsSimulated, hasAnyAttendance: calcHasAny, simulatedAttendances: simAtts };
        }
        if (simAtts.length > 0) {
            return { eighthDays: [], eighthMonth: targetMonth, isSimulated: calcIsSimulated, hasAnyAttendance: calcHasAny, simulatedAttendances: simAtts, milestones: [] };
        }
    }
    return { eighthDays: [], eighthMonth: targetMonth, isSimulated: false, hasAnyAttendance: false, milestones: [], simulatedAttendances: [] };"""

if old_sync_logic in content:
    content = content.replace(old_sync_logic, new_sync_logic)
    print("Replaced sync logic successfully.")
else:
    print("Could not find sync logic.")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)

