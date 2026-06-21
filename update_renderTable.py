import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of function renderTable(container, title, members, id)
start_idx = content.find('function renderTable(container, title, members, id) {')

if start_idx == -1:
    print("Could not find function renderTable")
    exit(1)

# Find the end of renderTable, which is before window.toggleNavSub = function
end_idx = content.find('window.toggleNavSub = function', start_idx)

if end_idx == -1:
    print("Could not find end of renderTable")
    exit(1)

new_function = """function renderTable(container, title, members, id) {
    const section = document.createElement('div');
    section.id = id;
    section.style.cssText = `margin-bottom: 40px; display: flex; gap: 15px; overflow-x: auto; max-width: 100%;`;

    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    const html1 = generateMonthTableHTML(title, members, id + '-1', currentYear, currentMonth);
    const html2 = generateMonthTableHTML(title, members, id + '-2', nextYear, nextMonth);

    section.innerHTML = html1 + html2;
    container.appendChild(section);

    if (window.targetMemberId) {
        setTimeout(() => {
            const el = document.getElementById(`row-${id}-1-${window.targetMemberId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 800);
    }
}

function generateMonthTableHTML(title, members, id, tYear, tMonth) {
    const daysInMonth = new Date(tYear, tMonth, 0).getDate();

    let html = `
        <div style="flex: 1; min-width: 850px; overflow: auto; max-height: 65vh; border: 1.5px solid #0f172a; border-radius: 4px; background: #fff; position: relative;">
            <div style="position: sticky; left: 0; z-index: 40; display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0f172a; padding: 10px 10px; background: #fff;">
                <h2 style="margin: 0; font-size: 1.2rem; font-weight: 900;">${title} (${members.length}명) - ${tYear}년 ${tMonth}월</h2>
            </div>
            <table style="width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; font-family: 'Noto Sans KR', sans-serif; min-width: 850px;">
                <colgroup>
                    <col style="width: 30px;">
                    <col style="width: 95px;">
                    ${Array.from({ length: daysInMonth }, () => `<col style="width: 25px;">`).join('')}
                </colgroup>
                <thead>
                    <tr style="background: #f8fafc;">
                        <th style="position: sticky; top: 0; left: 0; z-index: 30; background: #f8fafc; border-bottom: 1.5px solid #0f172a; border-right: 1.5px solid #0f172a; font-size: 0.65rem;">NO</th>
                        <th style="position: sticky; top: 0; left: 30px; z-index: 30; background: #f8fafc; border-bottom: 1.5px solid #0f172a; border-right: 1.5px solid #0f172a; font-size: 0.65rem; text-align: left; padding: 5px 2px;">회원정보/과정</th>
                        ${Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const dateObj = new Date(tYear, tMonth - 1, day);
                            const dayOfWeek = dateObj.getDay();
                            const dateStr = `${tYear}-${String(tMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isHoliday = !!(typeof KOREAN_HOLIDAYS_MAP !== 'undefined' && KOREAN_HOLIDAYS_MAP[dateStr]);
                            let color = '#0f172a';
                            if (dayOfWeek === 0 || isHoliday) {
                                color = '#ef4444';
                            } else if (dayOfWeek === 6) {
                                color = '#2563eb';
                            }
                            return `<th style="position: sticky; top: 0; z-index: 20; background: #f8fafc; border-bottom: 1.5px solid #0f172a; border-right: 1px solid #cbd5e1; padding: 2px 1px; font-size:0.6rem; font-weight:800; color: ${color};">${day}</th>`;
                        }).join('')}
                    </tr>
                </thead>
                <tbody>
    `;

    members.forEach((m, idx) => {
        const isTarget = window.targetMemberId && String(m.id) === String(window.targetMemberId);
        const rowId = `row-${id}-${m.id}`;
        const trBg = isTarget ? '#fffbeb' : '#ffffff';
        html += `<tr id="${rowId}" style="background: ${trBg};">
            <td style="position: sticky; left: 0; z-index: 10; background: inherit; text-align: center; font-weight: 700; font-size: 0.65rem; border-right: 1.5px solid #0f172a; border-bottom: 1px solid #0f172a;">${idx + 1}</td>
            <td style="position: sticky; left: 30px; z-index: 10; background: inherit; padding: 0; border-right: 1.5px solid #0f172a; border-bottom: 1px solid #0f172a; width: 95px; max-width: 95px; overflow: hidden; vertical-align: top;">
                <div style="height: 36px; padding: 2px; display: flex; flex-direction: column; justify-content: center; box-sizing: border-box; border-bottom: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 2px;">
                        <span style="font-weight: 900; font-size: 0.75rem; color: #000; line-height: 1;">${m.name || ''}</span>
                    </div>
                    <div style="font-size: 0.55rem; color: #64748b; line-height: 1; margin-top: 2px;">${m.phone || ''}</div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 0px; padding: 1px 2px;">
                    ${(() => {
                        const courses = (m.course || '').split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
                        if (courses.length === 0) return `<div style="height: 38px;"></div>`;
                        return courses.map(c => {
                            return `<div style="height: 38px; font-size: 0.55rem; color: #1d4ed8; background: #eff6ff; padding: 1px 2px; border-radius: 2px; display: flex; align-items: center; justify-content: center; text-align: center; line-height: 1.1; overflow: hidden; word-break: keep-all; margin-bottom: 2px;">${c}</div>`;
                        }).join('');
                    })()}
                </div>
            </td>`;

        let schedules = getAllLedgerMonthStats(m.id, tYear, tMonth);
        const coursesFoundSimulated = new Set();
        schedules = schedules.filter(s => {
            if (!s.eighthDay || isNaN(parseInt(s.eighthDay)) || Number(s.eighthDay) <= 0) return false;
            if (s.isSimulated) {
                if (coursesFoundSimulated.has(s.course)) return false;
                coursesFoundSimulated.add(s.course);
            }
            return true;
        });

        const paid = paymentsData.filter(p => String(p.memberId) === String(m.id) && String(p.year) === String(tYear) && String(p.month) === String(tMonth) && p.status === 'paid');

        const activeCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
        const slotsCount = Math.max(1, activeCourses.length);

        for (let day = 1; day <= daysInMonth; day++) {
            let cellHTML = `
                <div style="height: 36px; border-bottom: 1px solid #e2e8f0; box-sizing: border-box;"></div>
                <div style="display: flex; flex-direction: column; gap: 0px; height: 100%; min-height: ${(slotsCount * 38) + (slotsCount * 2)}px; padding: 1px;">
            `;
            
            for (let slot = 0; slot < slotsCount; slot++) {
                const c = activeCourses[slot] || '';
                
                let slotBg = '#ffffff';
                const dayOfWeek = new Date(tYear, tMonth - 1, day).getDay();
                const dateStr = `${tYear}-${String(tMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isHolidayInSys = holidaysData.find(h => h.date === dateStr);
                const isNationalHoliday = !!(typeof KOREAN_HOLIDAYS_MAP !== 'undefined' && KOREAN_HOLIDAYS_MAP[dateStr]);
                
                if (isHolidayInSys || isNationalHoliday || dayOfWeek === 0) {
                    slotBg = '#f1f5f9'; // 휴일 회색
                } else {
                    let schedule = null;
                    if (c && window.COURSE_SCHEDULES) {
                        schedule = window.COURSE_SCHEDULES[c] || window.COURSE_SCHEDULES[c.split('(')[0].trim()];
                    }
                    if (schedule && !schedule.includes(dayOfWeek)) {
                        slotBg = '#f1f5f9'; // 수업 없는 요일 회색
                    }
                }

                const expectedToday = schedules.filter(s => parseInt(s.eighthDay) === day && (!s.course || s.course.includes(c) || c.includes(s.course) || activeCourses.length === 0));
                
                const matchC = c.split('(')[0].trim();
                const paidToday = paid.filter(p => {
                    const pdDay = new Date(p.updatedAt || p.date).getDate();
                    const pCourse = (p.course || '').split('(')[0].trim();
                    return pdDay === day && (!c || pCourse === matchC);
                });

                let slotContent = '';
                if (expectedToday.length > 0) {
                    let uniqueExpected = [...expectedToday];
                    uniqueExpected.forEach(s => {
                        const feeColor = s.isSimulated ? '#3b82f6' : '#d946ef';
                        slotContent += `
                        <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1px solid ${feeColor}; border-radius: 4px; padding: 1px;">
                            <div style="color: ${feeColor};">${s.fee / 10000}만</div>
                        </div>`;
                    });
                }
                
                if (paidToday.length > 0) {
                    let uniquePaid = [...paidToday];
                    uniquePaid.forEach(p => {
                        const amt = p.amount ? (p.amount / 10000) + '만(실)' : '완료(실)';
                        slotContent += `
                        <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #ecfdf5; border: 1px solid #059669; border-radius: 4px; padding: 1px;">
                            <div style="color: #059669;">${amt}</div>
                        </div>`;
                    });
                }
                
                cellHTML += `
                <div style="flex: 1; min-height: 38px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: ${slotBg}; border-radius: 0px; padding: 1px; margin-bottom: 2px;">
                    ${slotContent}
                </div>`;
            }
            cellHTML += `</div>`;

            const isToday = (tYear === new Date().getFullYear() && tMonth === new Date().getMonth() + 1 && day === new Date().getDate());
            const todayStyle = isToday ? 'border-right: 1px dotted #cbd5e1; background: #fef9c333;' : 'border-right: 1px dotted #cbd5e1;';

            html += `<td style="vertical-align: top; text-align: center; border-bottom: 1px solid #0f172a; ${todayStyle} padding: 0;">${cellHTML}</td>`;
        }

        html += `</tr>`;
    });

    html += `</tbody></table></div>`;
    return html;
}
"""

new_content = content[:start_idx] + new_function + content[end_idx:]

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated renderTable logic successfully!")
