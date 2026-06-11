import os

path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/cycle_settings.html"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the general select
old_general = '<select id="pullGeneral" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1;">'
new_general = '<select id="pullGeneral" onchange="if(this.value) quickMove(this.value, \'general\')" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1;">'
content = content.replace(old_general, new_general)

old_btn_general = '<button onclick="if(document.getElementById(\'pullGeneral\').value) quickMove(document.getElementById(\'pullGeneral\').value, \'general\')" style="background: #10b981; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold;">가져오기</button>'
content = content.replace(old_btn_general, "")

# Replace the baking select
old_baking = '<select id="pullBaking" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #fde047; background: #fff;">'
new_baking = '<select id="pullBaking" onchange="if(this.value) quickMove(this.value, \'baking\')" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #fde047; background: #fff;">'
content = content.replace(old_baking, new_baking)

old_btn_baking = '<button onclick="if(document.getElementById(\'pullBaking\').value) quickMove(document.getElementById(\'pullBaking\').value, \'baking\')" style="background: #d97706; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold;">가져오기</button>'
content = content.replace(old_btn_baking, "")

# Replace the custom select
old_custom = '<select id="pullCustom" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #fca5a5; background: #fff;">'
new_custom = '<select id="pullCustom" onchange="if(this.value) quickMove(this.value, \'custom\')" style="flex: 1; padding: 8px; border-radius: 6px; border: 1px solid #fca5a5; background: #fff;">'
content = content.replace(old_custom, new_custom)

old_btn_custom = '<button onclick="if(document.getElementById(\'pullCustom\').value) quickMove(document.getElementById(\'pullCustom\').value, \'custom\')" style="background: #ef4444; color: white; border: none; padding: 8px 15px; border-radius: 6px; cursor: pointer; font-weight: bold;">가져오기</button>'
content = content.replace(old_btn_custom, "")

# Change default option text to indicate immediate action
content = content.replace('다른 그룹에서 과정 가져오기...', '클릭하여 다른 그룹에서 과정 가져오기...')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Selects updated to be instantaneous")
