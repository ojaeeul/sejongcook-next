import os
filepath = "public/sejong/sheet.html"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    new_content = content.replace("16.0 : 8.0", "17.0 : 8.0")
    if new_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Patched 16.0 to 17.0 in sheet.html")
