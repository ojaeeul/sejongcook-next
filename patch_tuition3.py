import os

filepath = "public/sejong/tuition_v3.js"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Remove firstTargetCount/subTargetCount logic
content = content.replace("let currentTargetCount = isFirstCycleForThisCourse ? firstTargetCount : subTargetCount;", "let currentTargetCount = targetCount;")
content = content.replace("isFirstCycleForThisCourse = false;", "")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

