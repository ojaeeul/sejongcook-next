import re

def update_css(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    content = content.replace("width: 50%;\n            height: 100%;\n            transform-style: preserve-3d;\n            transform-origin: left center;\n            z-index: 100;", 
                              "width: calc(50% - 20px);\n            height: 100%;\n            transform-style: preserve-3d;\n            transform-origin: left center;\n            z-index: 9;")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_css('Sejong/SejongAttendance/public/expense.html')
update_css('Sejong/SejongAttendance/public/phonebook.html')
print("CSS updated")
