import os

files = ["public/sejong/sheet.html", "public/sejong/shared_calc.js", "public/sejong/sms_v3.js"]

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Replace 160 with 170
        new_content = content.replace("Math.floor((vRaw - 170) / 160) + 1", "Math.floor((vRaw - 170) / 170) + 1")
        
        if new_content != content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Patched {filepath}")
        else:
            print(f"No changes needed for {filepath}")

