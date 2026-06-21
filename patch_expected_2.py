import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to collect simulatedAttendances inside getAllLedgerMonthStats
old_get_all_loop = """    const results = [];

    courses.forEach(courseName => {
        const stats = getLedgerMonthStats(memberId, year, month, courseName);
        // 가상 결제(예정) 내역을 항상 표시하도록 조건 완화
        if (true) {"""

new_get_all_loop = """    const results = [];
    let combinedSimulatedAttendances = [];

    courses.forEach(courseName => {
        const stats = getLedgerMonthStats(memberId, year, month, courseName);
        if (stats.simulatedAttendances && stats.simulatedAttendances.length > 0) {
            stats.simulatedAttendances.forEach(sa => {
                sa.course = courseName;
                combinedSimulatedAttendances.push(sa);
            });
        }
        // 가상 결제(예정) 내역을 항상 표시하도록 조건 완화
        if (true) {"""

if old_get_all_loop in content:
    content = content.replace(old_get_all_loop, new_get_all_loop)
    print("Replaced get_all_loop successfully.")
else:
    print("Could not find get_all_loop.")

old_get_all_return = """    });

    return results;
}"""

new_get_all_return = """    });

    results.simulatedAttendances = combinedSimulatedAttendances;
    return results;
}"""

if old_get_all_return in content:
    content = content.replace(old_get_all_return, new_get_all_return)
    print("Replaced get_all_return successfully.")
else:
    print("Could not find get_all_return.")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)

