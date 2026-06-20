import re

file_path = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace left column
target_left = r'<div style="font-size: 0.7rem; color: #64748b;">\$\{m\.phone \|\| \'\'\}</div>'
replacement_left = """<div style="font-size: 0.7rem; color: #64748b;">${m.phone || ''}</div>
                <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 0px; padding-bottom: 2px;">
                    ${(() => {
                        const courses = (m.course || '').split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
                        if (courses.length === 0) return `<div style="height: 38px;"></div>`;
                        return courses.map(c => {
                            return `<div style="height: 38px; font-size: 0.6rem; color: #1d4ed8; background: #eff6ff; padding: 2px 4px; border-radius: 2px; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1; overflow: hidden; word-break: keep-all; margin-bottom: 2px;">${c}</div>`;
                        }).join('');
                    })()}
                </div>"""
if "margin-top: 4px; display: flex;" not in content:
    content = re.sub(target_left, replacement_left, content)

# 2. Replace the loop
loop_pattern = re.compile(r'for \(let day = 1; day <= daysInMonth; day\+\+\) \{.*?tr\.innerHTML \+= `.*?</tr>`;?', re.DOTALL)

# wait, the end of the loop is `tr.innerHTML += ... </td>\n            `;\n        }`
loop_pattern = re.compile(r'for \(let day = 1; day <= daysInMonth; day\+\+\) \{.*?tr\.innerHTML \+= `.*?</td>\s*`;\s*\}', re.DOTALL)

replacement_loop = """for (let day = 1; day <= daysInMonth; day++) {
            const activeCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
            const slotsCount = Math.max(1, activeCourses.length);
            let cellHTML = `<div style="display: flex; flex-direction: column; gap: 0px; height: 100%; min-height: ${(slotsCount * 38) + (slotsCount * 2)}px;">`;
            
            for (let slot = 0; slot < slotsCount; slot++) {
                const c = activeCourses[slot] || '';
                
                let slotBg = '#ffffff';
                const dayOfWeek = new Date(currentYear, currentMonth - 1, day).getDay();
                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isHolidayInSys = holidaysData.find(h => h.date === dateStr);
                const isNationalHoliday = !!KOREAN_HOLIDAYS_MAP[dateStr];
                
                if (isHolidayInSys || isNationalHoliday || dayOfWeek === 0) {
                    slotBg = '#f1f5f9'; // 휴일 회색
                } else if (c && window.COURSE_SCHEDULES && window.COURSE_SCHEDULES[c]) {
                    if (!window.COURSE_SCHEDULES[c].includes(dayOfWeek)) {
                        slotBg = '#f1f5f9'; // 수업 없는 요일 회색
                    }
                }

                // Expected
                const expectedToday = schedules.filter(s => parseInt(s.eighthDay) === day && (!s.course || s.course.includes(c) || c.includes(s.course) || activeCourses.length === 0));
                
                // Actual 
                const matchC = c.split('(')[0].trim();
                const paidToday = paid.filter(p => {
                    const pdDay = new Date(p.updatedAt || p.date).getDate();
                    if (pdDay !== day) return false;
                    const pCourse = p.course ? p.course.split('(')[0].trim() : '';
                    return pCourse === matchC || !c || pCourse.includes(matchC) || matchC.includes(pCourse);
                });

                let slotContent = '';
                
                if (expectedToday.length > 0) {
                    expectedToday.forEach(s => {
                        const feeColor = s.isSimulated ? '#3b82f6' : '#d946ef';
                        slotContent += `
                        <div style="font-size: 0.6rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1px solid ${feeColor}; border-radius: 4px; padding: 2px;">
                            <div style="color: ${feeColor};">${s.fee / 10000}만</div>
                        </div>`;
                    });
                }
                
                if (paidToday.length > 0) {
                    let uniquePaid = [...paidToday];
                    uniquePaid.forEach(p => {
                        const amt = p.amount ? (p.amount / 10000) + '만' : '완료';
                        slotContent += `
                        <div style="font-size: 0.6rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #dcfce7; border: 1px solid #22c55e; border-radius: 4px; padding: 2px;">
                            <div style="color: #16a34a;">${amt}</div>
                        </div>`;
                    });
                }
                
                cellHTML += `
                <div style="flex: 1; min-height: 38px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: ${slotBg}; border-radius: 0px; padding: 1px; margin-bottom: 2px;">
                    ${slotContent}
                </div>`;
            }
            cellHTML += `</div>`;

            const isToday = (currentYear === new Date().getFullYear() && currentMonth === new Date().getMonth() + 1 && day === new Date().getDate());
            const todayStyle = isToday ? 'border: 2px solid #fbbf24; border-radius: 4px;' : 'border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;';

            tr.innerHTML += `
                <td style="padding: 2px; vertical-align: top; ${todayStyle}">
                    ${cellHTML}
                </td>
            `;
        }"""

content = loop_pattern.sub(replacement_loop, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied")
