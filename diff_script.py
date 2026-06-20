with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger.js', 'r') as f:
    l_lines = f.readlines()
with open('old_ledger_expected.js', 'r') as f:
    e_lines = f.readlines()

def extract_func(lines, func_name):
    start = -1
    for i, line in enumerate(lines):
        if line.startswith(f"function {func_name}"):
            start = i
            break
    if start == -1: return ""
    end = start
    braces = 0
    for i in range(start, len(lines)):
        braces += lines[i].count('{') - lines[i].count('}')
        if braces == 0 and lines[i].strip() == '}':
            end = i
            break
    return "".join(lines[start:end+1])

print("--- ledger.js getLedgerMonthStats ---")
print(extract_func(l_lines, "getLedgerMonthStats"))
print("--- old_ledger_expected.js getLedgerMonthStats ---")
print(extract_func(e_lines, "getLedgerMonthStats"))
