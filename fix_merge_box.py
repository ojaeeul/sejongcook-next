import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """                } else if (simAttendanceToday.length > 0) {
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
                }"""

new_code = """                } else if (simAttendanceToday.length > 0) {
                    // 가상출석 렌더링 (진짜 출석이 없을 때만)
                    
                    // 만약 이 날짜에 파란색 결재 예정일(expectedToday)이 함께 있다면 여기서 박스를 그리지 않고
                    // 금액 박스 안에 '가상출석' 글자를 합쳐서 그리도록 넘김.
                    let isAlsoSimulatedMilestone = false;
                    if (expectedToday.length > 0) {
                        isAlsoSimulatedMilestone = expectedToday.some(s => s.isSimulated);
                    }
                    
                    if (!isAlsoSimulatedMilestone) {
                        slotContent += `
                        <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #fef08a; border: 1px solid #eab308; border-radius: 4px; padding: 1px; width: 100%; text-align: center; color: #854d0e;">
                            가상<br>출석
                        </div>`;
                    }
                }

                if (expectedToday.length > 0) {
                    let uniqueExpected = [...expectedToday];
                    uniqueExpected.forEach(s => {
                        const feeColor = s.isSimulated ? '#3b82f6' : '#d946ef';
                        const feeBg = s.isSimulated ? '#eff6ff' : '#fdf4ff';
                        
                        let labelHtml = '';
                        // 가상출석이랑 겹치면 금액 박스 안에 가상출석 글자를 섞어줌
                        if (s.isSimulated && simAttendanceToday.length > 0 && realAttendanceToday.length === 0) {
                            labelHtml = `가상출석<br>`;
                        }

                        slotContent += `
                        <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: ${feeBg}; border: 1px solid ${feeColor}; border-radius: 4px; padding: 1px; margin-top: 1px; width: 100%; text-align: center;">
                            <div style="color: ${feeColor};">${labelHtml}${s.fee / 10000}만</div>
                        </div>`;
                    });
                }"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Successfully replaced code in ledger_expected.js")
else:
    print("Error: Could not find old code block")
