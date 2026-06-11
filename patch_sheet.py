import os

file_path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/sheet.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of loadData function and inject the setting loading
if "async function loadData() {" in content:
    new_loadData = """async function loadData() {
            try {
                if (typeof window.loadCycleSettings === 'function') {
                    await window.loadCycleSettings();
                }"""
    content = content.replace("async function loadData() {\n            try {", new_loadData)
    print("Patched loadData in sheet.html")
else:
    print("Could not find loadData in sheet.html")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
