import re

with open("Sejong/SejongAttendance/public/expense_logic.js", "r", encoding="utf-8") as f:
    js = f.read()

# Let's remove the window.ensureMinimumLines override
js = re.sub(r'const originalEnsureMinimumLines = ensureMinimumLines;.*?updateExpensePagination\(\);\n};', '', js, flags=re.DOTALL)

# Let's inject updateExpensePagination() at the end of the original ensureMinimumLines()
# The original function ends around line 550. Let's find its end.
if "    });\n}\n" in js:
    js = js.replace("    });\n}\n", "    });\n    if (typeof updateExpensePagination === 'function') updateExpensePagination();\n}\n", 1)

# Modify the padding logic inside ensureMinimumLines to pad to multiples of 32
# Currently it says: targetLines = Math.max(targetLines, 32);
js = js.replace('targetLines = Math.max(targetLines, 32);', 'targetLines = Math.ceil(Math.max(targetLines, 32) / 32) * 32;')

with open("Sejong/SejongAttendance/public/expense_logic.js", "w", encoding="utf-8") as f:
    f.write(js)

print("Fixed ensureMinimumLines padding.")
