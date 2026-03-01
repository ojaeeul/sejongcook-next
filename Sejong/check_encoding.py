
import re

file_path = r'c:\Users\세종요리\Desktop\Sejong\public\questions_data.js'

try:
    # Try reading as CP949
    with open(file_path, 'r', encoding='cp949') as f:
        content = f.read()
        matches = re.findall(r'"([^"]+?)":\s*\[', content)
        print(f"Read as CP949. Found {len(matches)} keys.")
        for m in sorted(matches):
             if '_20' in m: # Filter for exam keys
                print(f"Key: {m}")
except Exception as e:
    print(f"Error reading as CP949: {e}")
