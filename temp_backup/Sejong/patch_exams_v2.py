import os
import re

directory = r'c:\Users\세종요리\Desktop\Sejong\public'
files = [f for f in os.listdir(directory) if f.endswith('.html')]

subjects = ['한식', '양식', '일식', '중식', '제과', '제빵']
# Target calls like onclick="loadExamView"
pattern = r'onclick="loadExamView"\s+class="nav-item">(\d+)년\s+([^<]+)</a>'

for filename in files:
    path = os.path.join(directory, filename)
    content = None
    applied_enc = 'utf-8'
    for enc in ['utf-8', 'cp949', 'euc-kr', 'latin-1']:
        try:
            with open(path, 'r', encoding=enc) as f:
                content = f.read()
                applied_enc = enc
                break
        except:
            continue
    
    if content and 'onclick="loadExamView"' in content:
        print(f"Patching {filename} (detected encoding: {applied_enc})...")
        
        def replacer(match):
            year = match.group(1)
            subject_text = match.group(2).strip()
            # Determine subject key
            match_subject = '한식' # fallback
            for s in subjects:
                if s in subject_text:
                    match_subject = s
                    break
            return f'onclick="loadExamView(\'{match_subject}_{year}\')" class="nav-item">{year}년 {subject_text}</a>'
        
        new_content = re.sub(pattern, replacer, content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Successfully patched {filename}")
        else:
            print(f"No changes made to {filename}")
