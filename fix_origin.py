import re

with open("Sejong/SejongAttendance/public/expense_logic.js", "r", encoding="utf-8") as f:
    js = f.read()

js = js.replace("flipContainer.style.left = '0';", "flipContainer.style.left = '0';\n        flipContainer.style.transformOrigin = 'right center';")

with open("Sejong/SejongAttendance/public/expense_logic.js", "w", encoding="utf-8") as f:
    f.write(js)
