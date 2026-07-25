import os
import json
import re

with open("kr_holidays_2025_2035.json", "r", encoding="utf-8") as f:
    holidays_dict = json.load(f)

# Format into JS object properties
props = []
for k, v in holidays_dict.items():
    props.append(f'            "{k}": "{v}"')
map_content = "{\n" + ",\n".join(props) + "\n        }"

directory = "Sejong/SejongAttendance/public"

for filename in os.listdir(directory):
    if filename.endswith(".html") or filename.endswith(".js"):
        filepath = os.path.join(directory, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        if "const KOREAN_HOLIDAYS_MAP =" in content:
            new_content = re.sub(r'const\s+KOREAN_HOLIDAYS_MAP\s*=\s*\{.*?\}', 
                                 f'const KOREAN_HOLIDAYS_MAP = {map_content}', 
                                 content, 
                                 flags=re.DOTALL)
            
            if content != new_content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {filename}")
