import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I need to preserve `simulatedAttendances` after filter.
# Around line 642: 
#         let schedules = getAllLedgerMonthStats(m.id, tYear, tMonth);
#         const coursesFoundSimulated = new Set();
#         schedules = schedules.filter(s => {

old_filter = """        let schedules = getAllLedgerMonthStats(m.id, tYear, tMonth);
        const coursesFoundSimulated = new Set();
        schedules = schedules.filter(s => {"""

new_filter = """        let schedulesRaw = getAllLedgerMonthStats(m.id, tYear, tMonth);
        let schedules = [...schedulesRaw];
        schedules.simulatedAttendances = schedulesRaw.simulatedAttendances || [];
        const coursesFoundSimulated = new Set();
        schedules = schedules.filter(s => {"""

if old_filter in content:
    content = content.replace(old_filter, new_filter)
    print("Replaced filter successfully.")
else:
    print("Could not find filter.")

# Wait, `schedules = schedules.filter(s => ...` reassigns `schedules`!
# Let me fix the assignment correctly.
old_assignment = """            return true;
        });

        const paid = paymentsData.filter(p => String(p.memberId) === String(m.id) && String(p.year) === String(tYear) && String(p.month) === String(tMonth) && p.status === 'paid');"""

new_assignment = """            return true;
        });
        schedules.simulatedAttendances = schedulesRaw.simulatedAttendances || [];

        const paid = paymentsData.filter(p => String(p.memberId) === String(m.id) && String(p.year) === String(tYear) && String(p.month) === String(tMonth) && p.status === 'paid');"""

if old_assignment in content:
    content = content.replace(old_assignment, new_assignment)
    print("Replaced assignment successfully.")
else:
    print("Could not find assignment.")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)

