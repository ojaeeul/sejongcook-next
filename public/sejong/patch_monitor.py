import os

file_path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/monitor.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = [
    ('setupUI("번호 출석", "휴대폰 뒷번호 8자리를 입력하세요"', 'setupUI("번호 출석", "휴대폰 뒷번호 4자리를 입력하세요"'),
    ('setupUI("신규 얼굴 등록", "번호 8자리 입력 후 스캔 시작을 누르세요"', 'setupUI("신규 얼굴 등록", "번호 4자리 입력 후 스캔 시작을 누르세요"'),
    ('if (currentInput.length !== 8) {', 'if (currentInput.length !== 4) {'),
    ('showStatus("번호 8자리를 입력해주세요.", "red");', 'showStatus("번호 4자리를 입력해주세요.", "red");'),
    ('const phone8 = phoneStr.length >= 8 ? phoneStr.slice(-8) : phoneStr;', 'const phone4 = phoneStr.length >= 4 ? phoneStr.slice(-4) : phoneStr;'),
    ('await processAttendance(phone8, captureData);', 'await processAttendance(phone4, captureData);'),
    ('showStatus("먼저 뒷번호 8자리를 입력해주세요.", "red");', 'showStatus("먼저 뒷번호 4자리를 입력해주세요.", "red");'),
    ('showStatus("뒷번호 8자리와 일치하는 수강생 대장 회원이 없습니다.", "red");', 'showStatus("뒷번호 4자리와 일치하는 수강생 대장 회원이 없습니다.", "red");'),
    ('if (currentInput.length < 8) {', 'if (currentInput.length < 4) {'),
    ("if (currentInput.length === 8 && currentMode === 'number') {", "if (currentInput.length === 4 && currentMode === 'number') {")
]

for old_text, new_text in replacements:
    content = content.replace(old_text, new_text)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("monitor.js updated successfully")
