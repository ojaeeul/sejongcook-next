import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """                    allMilestones.push({ 
                        year: simDate.getFullYear(), 
                        month: simDate.getMonth() + 1, 
                        day: simDate.getDate(), 
                        isReal: false 
                    });
                    
                    break; 
                }"""

new_block = """                    allMilestones.push({ 
                        year: simDate.getFullYear(), 
                        month: simDate.getMonth() + 1, 
                        day: simDate.getDate(), 
                        isReal: false 
                    });
                    
                    // break removed so simulation continues until the limit
                }"""

if old_block in content:
    content = content.replace(old_block, new_block)
    print("Replaced successfully.")
else:
    print("Could not find block.")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js', 'w', encoding='utf-8') as f:
    f.write(content)

