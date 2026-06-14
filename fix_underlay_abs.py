import re

def update_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    js = js.replace("staticUnderlay.className = 'flip-page-underlay page';", 
                    "staticUnderlay.className = 'flip-page-underlay page';\n    staticUnderlay.style.position = 'absolute';")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

update_js('Sejong/SejongAttendance/public/expense_logic.js')
update_js('Sejong/SejongAttendance/public/phonebook.js')
print("Underlay absolute fixed")
