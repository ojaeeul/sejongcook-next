import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

# We want to replace the block starting from `<div style="margin-top: 4px; display: flex; flex-direction: column; gap: 2px;">`
# to `        html += `</tr>`;`

target_start = """                <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 2px;">
                    ${(() => {"""

target_end = """        html += `</tr>`;"""

idx_start = content.find(target_start)
idx_end = content.find(target_end, idx_start)

if idx_start == -1 or idx_end == -1:
    print("Could not find the target block to replace.")
    exit(1)

replacement = """                <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 4px; padding-bottom: 2px;">
                    ${(() => {
                        const courses = (m.course || '').split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
                        if (courses.length === 0) return `<div style="height: 38px;"></div>`;
                        return courses.map(c => {
                            return `<div style="height: 38px; font-size: 0.6rem; color: #1d4ed8; background: #eff6ff; padding: 2px 4px; border-radius: 4px; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1; overflow: hidden; word-break: keep-all;">${c}</div>`;
                        }).join('');
                    })()}
                </div>
            </td>`;

        let schedules = getAllLedgerMonthStats(m.id, currentYear, currentMonth);
        const coursesFoundSimulated = new Set();
        schedules = schedules.filter(s => {
            if (!s.eighthDay || isNaN(parseInt(s.eighthDay)) || Number(s.eighthDay) <= 0) return false;
            if (s.isSimulated) {
                if (coursesFoundSimulated.has(s.course)) return false;
                coursesFoundSimulated.add(s.course);
            }
            return true;
        });

        const paid = paymentsData.filter(p => String(p.memberId) === String(m.id) && String(p.year) === String(currentYear) && String(p.month) === String(currentMonth) && p.status === 'paid');

        const activeCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
        const slotsCount = Math.max(1, activeCourses.length);

        for (let day = 1; day <= daysInMonth; day++) {
            let cellHTML = `<div style="display: flex; flex-direction: column; gap: 4px; height: 100%; min-height: ${(slotsCount * 38) + ((slotsCount - 1) * 4)}px;">`;
            
            for (let slot = 0; slot < slotsCount; slot++) {
                const c = activeCourses[slot] || '';
                
                let bg = '#ffffff';
                const dayOfWeek = new Date(currentYear, currentMonth - 1, day).getDay();
                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isHolidayInSys = holidaysData.find(h => h.date === dateStr);
                const isNationalHoliday = !!(typeof KOREAN_HOLIDAYS_MAP !== 'undefined' && KOREAN_HOLIDAYS_MAP[dateStr]);
                const isHoliday = isHolidayInSys || isNationalHoliday;

                if (dayOfWeek === 0 || isHoliday) {
                    bg = '#f1f5f9';
                } else if (c) {
                    const cleanCourseName = c.replace(/\([^)]*\)/g, '').trim();
                    let allowedDays = window.COURSE_SCHEDULES && window.COURSE_SCHEDULES[cleanCourseName];
                    if (allowedDays && !allowedDays.includes(dayOfWeek)) {
                        bg = '#f1f5f9';
                    }
                }

                let slotHTML = `<div style="height: 38px; background: ${bg}; position: relative; border-radius: 4px; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; padding: 1px;">`;

                const matchingExpected = schedules.filter(s => parseInt(s.eighthDay) === day && (s.course === c || (!s.course && slot === 0)));
                const matchingPaid = paid.filter(p => new Date(p.updatedAt).getDate() === day && (p.course === c || (!p.course && slot === 0) || p.course === 'null' || p.course === 'undefined' || p.course === ''));

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

                cellHTML += slotHTML + `</div>`;
            }

            html += `<td style="vertical-align: top; border-right: 1px dotted #cbd5e1; padding: 4px 2px;">${cellHTML}</div></td>`;
        }

        html += `</tr>`;"""

new_content = content[:idx_start] + replacement + content[idx_end + len(target_end):]

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Patch applied successfully.")
