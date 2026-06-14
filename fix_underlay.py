import re

def update_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    # Apply width, height, and top to staticUnderlay
    js = js.replace("staticUnderlay.style.left = '0';", "staticUnderlay.style.left = '0';\n        staticUnderlay.style.width = 'calc(50% - 20px)';\n        staticUnderlay.style.height = '100%';\n        staticUnderlay.style.top = '0';")
    js = js.replace("staticUnderlay.style.right = '0';", "staticUnderlay.style.right = '0';\n        staticUnderlay.style.width = 'calc(50% - 20px)';\n        staticUnderlay.style.height = '100%';\n        staticUnderlay.style.top = '0';")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

update_js('Sejong/SejongAttendance/public/expense_logic.js')
update_js('Sejong/SejongAttendance/public/phonebook.js')
print("Underlay fixed")
