import os
import re

filepath = "public/sejong/tuition_v3.js"
if os.path.exists(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # We want to replace:
    # const targetCount = isDualBakeryLocal ? 17 : 9;
    # with:
    # const firstTargetCount = isDualBakeryLocal ? 17 : 9;
    # const subTargetCount = isDualBakeryLocal ? 16 : 8;
    # let isFirstCycleForThisCourse = true;
    
    old_target_def = "const targetCount = isDualBakeryLocal ? 17 : 9;"
    new_target_def = """const firstTargetCount = isDualBakeryLocal ? 17 : 9;
                const subTargetCount = isDualBakeryLocal ? 16 : 8;
                let isFirstCycleForThisCourse = true;"""
    
    content = content.replace(old_target_def, new_target_def)
    
    # We want to replace:
    # stats.allMilestones.forEach(ms => {
    # with:
    # stats.allMilestones.forEach(ms => {
    #     let currentTargetCount = isFirstCycleForThisCourse ? firstTargetCount : subTargetCount;
    
    old_loop_start = "stats.allMilestones.forEach(ms => {"
    new_loop_start = """stats.allMilestones.forEach(ms => {
                    let currentTargetCount = isFirstCycleForThisCourse ? firstTargetCount : subTargetCount;"""
    
    content = content.replace(old_loop_start, new_loop_start)
    
    # We want to replace all remainingForLoop -= targetCount;
    # with: remainingForLoop -= currentTargetCount; isFirstCycleForThisCourse = false;
    
    content = content.replace("remainingForLoop -= targetCount;", "remainingForLoop -= currentTargetCount;\n                            isFirstCycleForThisCourse = false;")
    
    # We also want to replace remainingForLoop >= targetCount
    content = content.replace("remainingForLoop >= targetCount", "remainingForLoop >= currentTargetCount")
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print("Patched tuition_v3.js")

