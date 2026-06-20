with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

target = """        // User Request: 출석 날짜가 없는 수강생은 수강료예정일 표시하지 마시고, 출석이 1개라도 있으면 표시하세요.
        if (stats.hasAnyAttendance) {"""

replacement = """        // 가상 결제(예정) 내역을 항상 표시하도록 조건 완화
        if (true) {"""

content = content.replace(target, replacement)

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied")
