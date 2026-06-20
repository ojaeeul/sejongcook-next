with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

target_start = """                let slotHTML = `<div style="height: 38px; background: ${bg}; position: relative; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; padding: 1px;">`;"""
target_end = """                cellHTML += slotHTML + `</div>`;"""

idx_start = content.find(target_start)
idx_end = content.find(target_end, idx_start)

if idx_start == -1 or idx_end == -1:
    print("Could not find the target block to replace.")
    exit(1)

replacement = """                let slotHTML = `<div style="height: 38px; background: ${bg}; position: relative; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; padding: 1px;">`;

                const cleanC = c.split('(')[0].trim();
                const matchC = (targetCourse) => {
                    if (!targetCourse || targetCourse === 'null' || targetCourse === 'undefined' || targetCourse === '') return false;
                    return targetCourse.split('(')[0].trim() === cleanC;
                };

                const matchingExpected = schedules.filter(s => parseInt(s.eighthDay) === day && (matchC(s.course) || (!s.course && slot === 0)));
                const matchingPaid = paid.filter(p => new Date(p.updatedAt).getDate() === day && (matchC(p.course) || (!p.course && slot === 0) || p.course === 'null' || p.course === 'undefined' || p.course === ''));

                matchingExpected.forEach(s => {
                    const feeColor = s.isSimulated ? '#3b82f6' : '#d946ef';
                    slotHTML += `<div style="font-size: 0.55rem; font-weight: 800; color: ${feeColor}; line-height: 1.1;">${s.fee / 10000}만</div>`;
                });
                
                let uniquePaid = [...matchingPaid];
                if (uniquePaid.length > 1) {
                    const hasCourse = uniquePaid.find(up => up.course && up.course !== 'null' && up.course !== 'undefined' && up.course !== '');
                    if (hasCourse) uniquePaid = [hasCourse];
                    else uniquePaid = [uniquePaid[0]];
                }
                
                uniquePaid.forEach(p => {
                    slotHTML += `<div style="font-size: 0.55rem; font-weight: 800; color: #059669; background: #ecfdf5; padding: 1px 2px; border-radius: 2px; line-height: 1.1; margin-top: 1px;">${p.amount / 10000}만(실)</div>`;
                });
"""

new_content = content[:idx_start] + replacement + content[idx_end:]

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Patch 2 applied successfully.")
