import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace section.style.cssText
old_section_style = "section.style.cssText = `margin-bottom: 40px; display: flex; gap: 15px; overflow-x: auto; max-width: 100%;`;"
new_section_style = "section.style.cssText = `margin-bottom: 40px; display: flex; gap: 15px; overflow: auto; max-height: 65vh; max-width: 100%;`;"
content = content.replace(old_section_style, new_section_style)

# Replace table wrapper style
old_wrapper_style = "<div style=\"flex: 1; min-width: 850px; overflow: auto; max-height: 65vh; border: 1.5px solid #0f172a; border-radius: 4px; background: #fff; position: relative;\">"
new_wrapper_style = "<div style=\"flex: 0 0 auto; width: 900px; border: 1.5px solid #0f172a; border-radius: 4px; background: #fff; position: relative;\">"
content = content.replace(old_wrapper_style, new_wrapper_style)

# Also ensure table layout min-width is changed to fit exactly 900px (so it doesn't stretch past wrapper)
# We had: min-width: 850px; on the table.
# Let's change the table min-width to 900px as well.
content = content.replace("min-width: 850px;\">", "min-width: 900px;\">")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated scroll logic successfully!")
