import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_logic = """                // 가상출석 렌더링 (단, 해당 날짜에 진짜 출석이 있으면 무시하는 로직은 이미 shared_calc.js에서 오늘/과거 날짜의 경우 필터링됨)
                if (simAttendanceToday.length > 0) {
                    slotContent += `
                    <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #fef08a; border: 1px solid #eab308; border-radius: 4px; padding: 1px; width: 100%; text-align: center; color: #854d0e;">
                        가상출석
                    </div>`;
                }"""

new_logic = """                // 진짜 출석 렌더링 (attendanceData 활용)
                const realAttendanceToday = (window.attendanceData || []).filter(a => {
                    if (String(a.memberId) !== String(m.id)) return false;
                    const aDate = new Date(a.date);
                    if (aDate.getFullYear() !== tYear || (aDate.getMonth() + 1) !== tMonth || aDate.getDate() !== day) return false;
                    if (c && a.course) {
                        const aC = a.course.split('(')[0].trim();
                        const matchC = c.split('(')[0].trim();
                        return aC === matchC || a.course.includes(matchC) || c.includes(aC);
                    }
                    return true;
                });

                if (realAttendanceToday.length > 0) {
                    const attType = realAttendanceToday[0].status; // '출석', '결석', '지각' 등
                    let attBg = '#d1fae5'; // 기본 연두색
                    let attColor = '#065f46';
                    let attText = attType;
                    
                    if (attType === '결석') {
                        attBg = '#fee2e2';
                        attColor = '#991b1b';
                    } else if (attType === '지각') {
                        attBg = '#ffedd5';
                        attColor = '#9a3412';
                    } else if (attType === '공결' || attType === '조퇴') {
                        attBg = '#e0e7ff';
                        attColor = '#3730a3';
                    }
                    
                    // 가상출석 대신 진짜 출석을 그림
                    slotContent += `
                    <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: ${attBg}; border: 1px solid ${attColor}; border-radius: 4px; padding: 1px; width: 100%; text-align: center; color: ${attColor};">
                        ${attText}
                    </div>`;
                } else if (simAttendanceToday.length > 0) {
                    // 가상출석 렌더링 (진짜 출석이 없을 때만)
                    slotContent += `
                    <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #fef08a; border: 1px solid #eab308; border-radius: 4px; padding: 1px; width: 100%; text-align: center; color: #854d0e;">
                        가상<br>출석
                    </div>`;
                }"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    print("Replaced logic successfully.")
else:
    print("Could not find logic.")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)

