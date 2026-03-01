import os
import re

directory = r'c:\Users\세종요리\Desktop\Sejong\public'
files = [f for f in os.listdir(directory) if f.endswith('.html')]

subjects = ['한식', '양식', '일식', '중식', '제과', '제빵']
pattern = r'onclick="loadExamView"\s+class="nav-item">(\d+)년\s+([^<]+)</a>'

for filename in files:
    path = os.path.join(directory, filename)
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        with open(path, 'r', encoding='cp949') as f:
            content = f.read()
    
    # Check if the file contains the pattern
    if 'onclick="loadExamView"' in content:
        print(f"Patching {filename}...")
        
        def replacer(match):
            year = match.group(1)
            subject = match.group(2).strip()
            # Find which of our allowed subjects it matches
            match_subject = subject
            for s in subjects:
                if s in subject:
                    match_subject = s
                    break
            return f'onclick="loadExamView(\'{match_subject}_{year}\')" class="nav-item">{year}년 {subject}</a>'
        
        new_content = re.sub(pattern, replacer, content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Successfully patched {filename}")
        else:
            print(f"No changes made to {filename}")
