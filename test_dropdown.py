import re

html = open('Sejong/SejongAttendance/public/sheet.html', 'r', encoding='utf-8').read()
matches = re.findall(r'selectPresentType\((.*?)\)', html)
print(matches)
