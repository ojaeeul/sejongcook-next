
import re

file_path = r'c:\Users\세종요리\Desktop\Sejong\public\questions_data.js'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        # Look for keys like "something": [
        matches = re.findall(r'"([^"]+?)":\s*\[', content)
        print(f"Found {len(matches)} keys.")
        for m in sorted(matches):
            print(f"Key: {m}")
except Exception as e:
    print(f"Error: {e}")
