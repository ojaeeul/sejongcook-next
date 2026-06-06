import os

files_160 = ["public/sejong/sheet.html", "public/sejong/shared_calc.js", "public/sejong/sms_v3.js", "public/sejong/tuition_v4.js"]
for filepath in files_160:
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        new_content = content.replace("Math.floor((vRaw - 170) / 170) + 1", "Math.floor((vRaw - 170) / 160) + 1")
        if new_content != content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Reverted 160 in {filepath}")

if os.path.exists("public/sejong/sheet.html"):
    with open("public/sejong/sheet.html", "r", encoding="utf-8") as f:
        content = f.read()
    new_content = content.replace("17.0 : 8.0", "16.0 : 8.0")
    if new_content != content:
        with open("public/sejong/sheet.html", "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Reverted 17.0 to 16.0 in sheet.html")

