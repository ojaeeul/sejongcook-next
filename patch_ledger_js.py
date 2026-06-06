import re

with open("public/sejong/ledger.js", "r", encoding="utf-8") as f:
    content = f.read()

# Define the new getLedgerMonthStats replacement
new_function = """function getLedgerMonthStats(memberId, targetYear, targetMonth, courseFilter = null) {
    const syncKey = `${memberId}_${targetYear}_${targetMonth}_${courseFilter || 'all'}`;
    const syncData = window.ledgerSyncData || JSON.parse(localStorage.getItem('sejong_ledger_sync') || '{}');
    
    // 1. Check real milestone
    if (syncData[syncKey]) {
        const rawSync = syncData[syncKey];
        const days = Array.isArray(rawSync) ? rawSync : (typeof rawSync === 'number' ? [rawSync] : []);
        if (days.length > 0) {
            return { eighthDays: days, eighthMonth: targetMonth, isSimulated: false, hasAnyAttendance: true };
        }
    }

    const m = membersData.find(m => String(m.id) === String(memberId));
    if (!m) return { eighthDays: [], eighthMonth: targetMonth, isSimulated: false, hasAnyAttendance: false };

    // Use shared engine
    const result = window.calculateRedBoxesForMonth(m, targetYear, targetMonth, attendanceData, courseFilter, GLOBAL_DATA_ADJUSTMENTS);
    return { eighthDays: result.redDays, eighthMonth: targetMonth, isSimulated: result.isSimulated, hasAnyAttendance: result.hasAnyAttendance };
}"""

# Use regex to replace the old function block
# We know it starts at `function getLedgerMonthStats(memberId, targetYear, targetMonth, courseFilter = null) {`
# and ends after the `return { eighthDays: ..., eighthMonth: targetMonth, isSimulated: true, hasAnyAttendance: ... };` block.
# Actually, since it's quite long, we can find the start index and end index.
start_idx = content.find("function getLedgerMonthStats(memberId, targetYear, targetMonth, courseFilter = null) {")

if start_idx != -1:
    # Find the next function definition which is probably `function loadData` or something else
    end_idx = content.find("function getAllLedgerMonthStats", start_idx)
    if end_idx != -1:
        # The block is from start_idx to end_idx - 1
        content = content[:start_idx] + new_function + "\n\n" + content[end_idx:]
        with open("public/sejong/ledger.js", "w", encoding="utf-8") as f:
            f.write(content)
        print("Successfully replaced getLedgerMonthStats in ledger.js")
    else:
        print("Could not find end of getLedgerMonthStats")
else:
    print("Could not find start of getLedgerMonthStats")
