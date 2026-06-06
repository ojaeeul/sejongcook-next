import re

with open("public/sejong/ledger.js", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update getAllLedgerMonthStats
old_func = """function getAllLedgerMonthStats(memberId, year, month) {
    const member = membersData.find(m => String(m.id) === String(memberId));
    if (!member || !member.course) return [];

    const courses = member.course.split(',').map(c => c.split('(')[0].trim());
    const results = [];

    courses.forEach(courseName => {"""

new_func = """function getAllLedgerMonthStats(memberId, year, month) {
    const member = membersData.find(m => String(m.id) === String(memberId));
    if (!member || !member.course) return [];

    let courses = member.course.split(',').map(c => c.split('(')[0].trim());
    const hasJeggwa = courses.some(c => c.includes('제과') && !c.includes('제과제빵'));
    const hasJeppang = courses.some(c => c.includes('제빵') && !c.includes('제과제빵'));
    if (hasJeggwa && hasJeppang) {
        courses = courses.filter(c => !c.includes('제과') && !c.includes('제빵'));
        courses.push('제과제빵기능사');
    }

    const results = [];

    courses.forEach(courseName => {"""

if old_func in content:
    content = content.replace(old_func, new_func)
    print("Patched getAllLedgerMonthStats")
else:
    print("Could not find old_func in ledger.js")

# 2. Update renderTable bubble logic
old_bubble = """${(m.course || '').split(',').filter(Boolean).map(c => `<span style="background: #eff6ff; color: #1d4ed8; padding: 2px 5px; border-radius: 3px; border: 1px solid #bfdbfe; white-space: nowrap; line-height: 1; font-size: 0.55rem;">${c.trim()}</span>`).join('')}"""

new_bubble = """${(() => {
    let cs = (m.course || '').split(',').map(c => c.trim()).filter(Boolean);
    const hjg = cs.some(c => c.includes('제과') && !c.includes('제과제빵'));
    const hjp = cs.some(c => c.includes('제빵') && !c.includes('제과제빵'));
    if (hjg && hjp) {
        cs = cs.filter(c => !c.includes('제과') && !c.includes('제빵'));
        cs.push('제과제빵');
    }
    return cs.map(c => `<span style="background: #eff6ff; color: #1d4ed8; padding: 2px 5px; border-radius: 3px; border: 1px solid #bfdbfe; white-space: nowrap; line-height: 1; font-size: 0.55rem;">${c}</span>`).join('');
})()}"""

if old_bubble in content:
    content = content.replace(old_bubble, new_bubble)
    print("Patched renderTable bubble UI")
else:
    print("Could not find old_bubble in ledger.js")

with open("public/sejong/ledger.js", "w", encoding="utf-8") as f:
    f.write(content)
