import re
import os

def remove_hints_robust(text):
    prev = ""
    while text != prev:
        prev = text
        # Remove innermost (...) if they contain Korean
        text = re.sub(r'\s?\([^()]*[\uac00-\ud7af][^()]*\)', '', text)
        # Remove innermost [...] if they contain Korean
        text = re.sub(r'\s?\[[^[\]]*[\uac00-\ud7af][^[\]]*\]', '', text)
    return text

public_dir = 'public'
files = [f for f in os.listdir(public_dir) if f.endswith('.html') and any(f.startswith(p) for p in ['한식_', '양식_', '일식_', '중식_', '제과_', '제빵_', 'hansik_'])]

for filename in files:
    filepath = os.path.join(public_dir, filename)
    print(f"Cleaning hints in {filename}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Surgical fix for specifically broken strings if any (like the ?+40.6 pattern)
    content = re.sub(r'\?\+[\d.]+,[^?)]+\)$', '?', content, flags=re.MULTILINE)
    
    # Generic cleanup
    new_content = remove_hints_robust(content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

print("HTML cleanup complete.")
