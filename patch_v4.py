import os
filepath = "public/sejong/tuition_v4.js"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    new_content = content.replace("Math.floor((vRaw - 170) / 160) + 1", "Math.floor((vRaw - 170) / 170) + 1")
    if new_content != content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Patched v4")
