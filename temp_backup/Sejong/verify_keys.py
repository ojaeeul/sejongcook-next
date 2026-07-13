
import json
import sys

# Force utf-8 for stdout
sys.stdout.reconfigure(encoding='utf-8')

file_path = r'c:\Users\세종요리\Desktop\Sejong\public\questions_data.json'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    print("Checking keys for 제과 and 제빵...")
    jegwa_keys = [k for k in data.keys() if '제과' in k]
    jebbang_keys = [k for k in data.keys() if '제빵' in k]
    
    print(f"제과 Keys: {sorted(jegwa_keys)}")
    print(f"제빵 Keys: {sorted(jebbang_keys)}")
    
    # Check sample data count
    if '제과_2021' in data:
        print(f"제과_2021 count: {len(data['제과_2021'])}")
    else:
        print("제과_2021 NOT FOUND")
        
    if '제빵_2021' in data:
        print(f"제빵_2021 count: {len(data['제빵_2021'])}")
    else:
        print("제빵_2021 NOT FOUND")

except Exception as e:
    print(f"Error: {e}")
