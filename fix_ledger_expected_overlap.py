import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the simAttendanceToday block to NOT render anything if there's a simulated milestone
old_sim_block = """                } else if (simAttendanceToday.length > 0) {
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

new_sim_block = """                } else if (simAttendanceToday.length > 0) {
                    // 가상출석 렌더링 (진짜 출석이 없을 때만)
                    let isAlsoSimulatedMilestone = false;
                    if (expectedToday.length > 0) {
                        isAlsoSimulatedMilestone = expectedToday.some(s => s.isSimulated);
                    }
                    
                    // 파란색 결재 예정일이 함께 있다면 여기서 박스를 그리지 않고 (중복 방지)
                    // 아래 expectedToday 렌더링에서 통합해서 하나의 파란색 박스로 그림
                    if (!isAlsoSimulatedMilestone) {
                        slotContent += `
                        <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: #fef08a; border: 1px solid #eab308; border-radius: 4px; padding: 1px; width: 100%; text-align: center; color: #854d0e;">
                            가상<br>출석
                        </div>`;
                    }
                }"""

if old_sim_block in content:
    content = content.replace(old_sim_block, new_sim_block)
    print("Fixed simAttendanceToday block")
else:
    print("Could not find old_sim_block")


# Replace the expectedToday block to render the combined text
old_expected_block = """                if (expectedToday.length > 0) {
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

new_expected_block = """                if (expectedToday.length > 0) {
                    let uniqueExpected = [...expectedToday];
                    uniqueExpected.forEach(s => {
                        const feeColor = s.isSimulated ? '#3b82f6' : '#d946ef';
                        const feeBg = s.isSimulated ? '#eff6ff' : '#fdf4ff';
                        
                        let labelHtml = '';
                        // 가상출석이랑 겹치면 금액 박스 안에 가상출석 글자를 섞어줌
                        if (s.isSimulated && simAttendanceToday.length > 0 && realAttendanceToday.length === 0) {
                            labelHtml = `가상출석, `;
                        }

                        slotContent += `
                        <div style="font-size: 0.5rem; font-weight: 800; display: flex; flex-direction: column; align-items: center; background: ${feeBg}; border: 1px solid ${feeColor}; border-radius: 4px; padding: 1px; margin-top: 1px; width: 100%; text-align: center;">
                            <div style="color: ${feeColor};">${labelHtml}${s.fee / 10000}만</div>
                        </div>`;
                    });
                }"""

if old_expected_block in content:
    content = content.replace(old_expected_block, new_expected_block)
    print("Fixed expectedToday block")
else:
    print("Could not find old_expected_block")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)

