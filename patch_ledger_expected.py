import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace filterByPeriod
new_filter = """    const filterByPeriod = (members) => {
        return members.filter(m => {
            const schedules = getAllLedgerMonthStats(m.id, currentYear, currentMonth);
            const hasMatch = schedules.length > 0;
            return hasMatch;
        });
    };"""
content = re.sub(r'    const filterByPeriod = \(members\) => \{.*?    \};\n', new_filter + '\n', content, flags=re.DOTALL)

# Replace renderTable
new_render_table = """function renderTable(container, title, members, id) {
    const section = document.createElement('div');
    section.id = id;
    section.style.cssText = `margin-bottom: 40px;`;

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #0f172a; margin-bottom: 12px; padding: 10px 0;">
            <h2 style="margin: 0; font-size: 1.4rem; font-weight: 900;">${title} (${members.length}명) - ${currentYear}년 ${currentMonth}월</h2>
        </div>
        <div style="overflow-x: auto; border: 1.5px solid #0f172a; border-radius: 4px; background: #fff;">
            <table style="width: 100%; border-collapse: collapse; table-layout: fixed; font-family: 'Noto Sans KR', sans-serif; min-width: 1200px;">
                <colgroup>
                    <col style="width: 35px;">
                    <col style="width: 105px;">
                    ${Array.from({ length: daysInMonth }, () => `<col style="width: calc((100% - 140px) / ${daysInMonth});">`).join('')}
                </colgroup>
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 1.5px solid #0f172a;">
                        <th style="border-right: 1.5px solid #0f172a; font-size: 0.75rem;">NO</th>
                        <th style="border-right: 1.5px solid #0f172a; font-size: 0.75rem; text-align: left; padding: 10px 5px;">회원정보/과정</th>
                        ${Array.from({ length: daysInMonth }, (_, i) => {
                            const day = i + 1;
                            const isWeekend = new Date(currentYear, currentMonth - 1, day).getDay() === 0 || new Date(currentYear, currentMonth - 1, day).getDay() === 6;
                            const color = isWeekend ? '#ef4444' : '#0f172a';
                            return `<th style="border-right: 1px solid #cbd5e1; padding: 4px 2px; font-size:0.75rem; font-weight:800; color: ${color};">${day}일</th>`;
                        }).join('')}
                    </tr>
                </thead>
                <tbody>
    `;

    members.forEach((m, idx) => {
        const isTarget = window.targetMemberId && String(m.id) === String(window.targetMemberId);
        const rowId = `row-${id}-${m.id}`;
        html += `<tr id="${rowId}" style="border-bottom: 1px solid #0f172a; ${isTarget ? 'background: #fffbeb;' : ''}">
            <td style="text-align: center; font-weight: 700; border-right: 1.5px solid #0f172a;">${idx + 1}</td>
            <td style="padding: 6px 4px; border-right: 1.5px solid #0f172a; width: 105px; max-width: 105px; overflow: hidden;">
                <div style="display: flex; align-items: center; gap: 2px;">
                    <span style="font-weight: 900; font-size: 0.85rem; color: #000;">${m.name || ''}</span>
                </div>
                <div style="font-size: 0.7rem; color: #64748b;">${m.phone || ''}</div>
                <div style="margin-top: 4px; display: flex; flex-direction: column; gap: 2px;">
                    ${(() => {
                        const courses = (m.course || '').split(',').map(c => c.trim());
                        return courses.map(c => {
                            if (!c || c.includes('[삭제]')) return '';
                            return `<div style="font-size: 0.6rem; color: #1d4ed8; background: #eff6ff; padding: 1px 3px; border-radius: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c}</div>`;
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

        for (let day = 1; day <= daysInMonth; day++) {
            let cellHTML = '';
            
            // Expected
            const expectedToday = schedules.filter(s => parseInt(s.eighthDay) === day);
            if (expectedToday.length > 0) {
                expectedToday.forEach(s => {
                    const feeColor = s.isSimulated ? '#3b82f6' : '#d946ef';
                    cellHTML += `
                    <div style="font-size: 0.6rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1px solid ${feeColor}; border-radius: 4px; padding: 2px; margin-bottom: 2px;">
                        <div style="color: ${feeColor};">${s.fee / 10000}만</div>
                        <div style="font-size: 0.55rem; color: #64748b; line-height: 1;">${(s.course || '').replace('기능사', '')}</div>
                    </div>`;
                });
            }

            // Actual
            const paidToday = paid.filter(p => new Date(p.updatedAt).getDate() === day);
            if (paidToday.length > 0) {
                let uniquePaid = [...paidToday];
                if (uniquePaid.length > 1 && uniquePaid.some(up => !up.course || up.course === 'null' || up.course === 'undefined' || up.course === '')) {
                    uniquePaid = uniquePaid.filter(up => up.course && up.course !== 'null' && up.course !== 'undefined' && up.course !== '');
                    if (uniquePaid.length === 0) uniquePaid = [paidToday[0]];
                }
                
                uniquePaid.forEach(p => {
                    cellHTML += `
                    <div style="font-size: 0.6rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #ecfdf5; border: 1px solid #059669; border-radius: 4px; padding: 2px; margin-bottom: 2px;">
                        <div style="color: #059669;">${p.amount / 10000}만(실)</div>
                        ${p.course && p.course !== 'null' && p.course !== 'undefined' ? `<div style="font-size: 0.55rem; color: #047857; line-height: 1;">${p.course.replace('기능사', '')}</div>` : ''}
                    </div>`;
                });
            }

            html += `<td style="vertical-align: top; text-align: center; border-right: 1px dotted #cbd5e1; padding: 2px;">${cellHTML}</td>`;
        }

        html += `</tr>`;
    });

    html += `</tbody></table></div>`;
    section.innerHTML = html;
    container.appendChild(section);

    if (window.targetMemberId) {
        setTimeout(() => {
            const el = document.getElementById(`row-${id}-${window.targetMemberId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 800);
    }
}"""

content = re.sub(r'function renderTable\(container, title, members, id\) \{.*?\n\}\n(?=function renderOtherMembersTable|window\.toggleNavSub)', new_render_table + '\n', content, flags=re.DOTALL)

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)
