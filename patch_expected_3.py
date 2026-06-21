import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I need to add rendering logic for simulated attendances inside generateMonthTableHTML
# Around line 653: const slotsCount = Math.max(1, activeCourses.length);
# ...
#                const expectedToday = schedules.filter(s => parseInt(s.eighthDay) === day && (!s.course || s.course.includes(c) || c.includes(s.course) || activeCourses.length === 0));

old_content_render = """                const expectedToday = schedules.filter(s => parseInt(s.eighthDay) === day && (!s.course || s.course.includes(c) || c.includes(s.course) || activeCourses.length === 0));
                
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
                </div>`;"""

new_content_render = """                const expectedToday = schedules.filter(s => parseInt(s.eighthDay) === day && (!s.course || s.course.includes(c) || c.includes(s.course) || activeCourses.length === 0));
                
                const matchC = c.split('(')[0].trim();
                const paidToday = paid.filter(p => {
                    const pdDay = new Date(p.updatedAt || p.date).getDate();
                    const pCourse = (p.course || '').split('(')[0].trim();
                    return pdDay === day && (!c || pCourse === matchC);
                });
                
                const simAttendanceToday = (schedules.simulatedAttendances || []).filter(sa => sa.day === day && (!sa.course || sa.course.includes(c) || c.includes(sa.course) || activeCourses.length === 0));

                let slotContent = '';
                
                // 가상출석 렌더링 (단, 해당 날짜에 진짜 출석이 있으면 무시하는 로직은 이미 shared_calc.js에서 오늘/과거 날짜의 경우 필터링됨)
                if (simAttendanceToday.length > 0) {
                    slotContent += `
                    <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #fef08a; border: 1px solid #eab308; border-radius: 4px; padding: 1px; width: 100%; text-align: center; color: #854d0e;">
                        가상출석
                    </div>`;
                }

                if (expectedToday.length > 0) {
                    let uniqueExpected = [...expectedToday];
                    uniqueExpected.forEach(s => {
                        const feeColor = s.isSimulated ? '#3b82f6' : '#d946ef';
                        slotContent += `
                        <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #f8fafc; border: 1px solid ${feeColor}; border-radius: 4px; padding: 1px; margin-top: 1px;">
                            <div style="color: ${feeColor};">${s.fee / 10000}만</div>
                        </div>`;
                    });
                }
                
                if (paidToday.length > 0) {
                    let uniquePaid = [...paidToday];
                    uniquePaid.forEach(p => {
                        const amt = p.amount ? (p.amount / 10000) + '만(실)' : '완료(실)';
                        slotContent += `
                        <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #ecfdf5; border: 1px solid #059669; border-radius: 4px; padding: 1px; margin-top: 1px;">
                            <div style="color: #059669;">${amt}</div>
                        </div>`;
                    });
                }
                
                cellHTML += `
                <div style="flex: 1; min-height: 38px; display: flex; flex-direction: column; justify-content: center; align-items: center; background: ${slotBg}; border-radius: 0px; padding: 1px; margin-bottom: 2px;">
                    ${slotContent}
                </div>`;"""

if old_content_render in content:
    content = content.replace(old_content_render, new_content_render)
    print("Replaced content_render successfully.")
else:
    print("Could not find content_render.")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)

