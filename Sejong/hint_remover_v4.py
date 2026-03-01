import os
import re

def remove_hints_comprehensive(text):
    if not isinstance(text, str): return text
    
    # Half-width and Full-width parentheses
    # ( ) [ ] （ ） ［ ］
    
    prev = ""
    while text != prev:
        prev = text
        # Remove (...) or （ ... ） containing Hangul
        text = re.sub(r'\s?[\(\uff08][^()\uff08\uff09]*[\uac00-\ud7af][^()\uff08\uff09]*[\)\uff09]', '', text)
        # Remove [...] or ［ ... ］ containing Hangul
        text = re.sub(r'\s?[\[\uff3b][^\[\]\uff3b\uff3d]*[\uac00-\ud7af][^\[\]\uff3b\uff3d]*[\]\uff3d]', '', text)
    
    # Specific fix for the user's string without relying on regex if possible
    text = text.replace('(일반적 냉장)', '')
    text = text.replace('（일반적 냉장）', '')
    
    return text

public_dir = 'public'
encodings = ['utf-8', 'cp949', 'euc-kr']

for filename in os.listdir(public_dir):
    if filename.endswith(('.html', '.js', '.json')):
        filepath = os.path.join(public_dir, filename)
        content = None
        used_encoding = None
        
        for enc in encodings:
            try:
                with open(filepath, 'r', encoding=enc) as f:
                    content = f.read()
                    used_encoding = enc
                    break
            except:
                continue
        
        if content:
            new_content = remove_hints_comprehensive(content)
            
            if new_content != content:
                print(f"Cleaning {filename} (using {used_encoding})...")
                with open(filepath, 'w', encoding=used_encoding) as f:
                    f.write(new_content)

print("Comprehensive cleanup complete.")
