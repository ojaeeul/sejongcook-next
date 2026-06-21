import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js', 'r', encoding='utf-8') as f:
    shared_content = f.read()

# Fix limitCounter in shared_calc.js
old_while = "while (simDate <= limit && limitCounter < 100) {"
new_while = "while (simDate <= limit && limitCounter < 2000) {"
if old_while in shared_content:
    shared_content = shared_content.replace(old_while, new_while)
    print("Fixed limitCounter in shared_calc.js")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js', 'w', encoding='utf-8') as f:
    f.write(shared_content)


with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    ledger_content = f.read()

# Fix colors in ledger_expected.js
old_render = """                } else if (simAttendanceToday.length > 0) {
                    // 가상출석 렌더링 (진짜 출석이 없을 때만)
                    slotContent += `
                    <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #fef08a; border: 1px solid #eab308; border-radius: 4px; padding: 1px; width: 100%; text-align: center; color: #854d0e;">
                        가상<br>출석
                    </div>`;
                }"""

new_render = """                } else if (simAttendanceToday.length > 0) {
                    // 가상출석 렌더링 (진짜 출석이 없을 때만)
                    
                    // 만약 이 날짜에 파란색 결재 예정일(expectedToday)이 함께 있다면 파란색 박스로 표시
                    let isAlsoSimulatedMilestone = false;
                    if (expectedToday.length > 0) {
                        isAlsoSimulatedMilestone = expectedToday.some(s => s.isSimulated);
                    }
                    
                    let bg = '#fef08a';
                    let border = '#eab308';
                    let color = '#854d0e';
                    
                    if (isAlsoSimulatedMilestone) {
                        bg = '#eff6ff';      // 파란색 바탕
                        border = '#3b82f6';  // 파란색 테두리
                        color = '#1d4ed8';   // 파란색 글씨
                    }
                    
                    slotContent += `
                    <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: ${bg}; border: 1px solid ${border}; border-radius: 4px; padding: 1px; width: 100%; text-align: center; color: ${color};">
                        가상<br>출석
                    </div>`;
                }"""

if old_render in ledger_content:
    ledger_content = ledger_content.replace(old_render, new_render)
    print("Fixed colors in ledger_expected.js")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(ledger_content)

