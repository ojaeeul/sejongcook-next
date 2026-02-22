import os
import re

def remove_hints(text):
    prev = ""
    while text != prev:
        prev = text
        text = re.sub(r'\s?\([^()]*[\uac00-\ud7af][^()]*\)', '', text)
        text = re.sub(r'\s?\[[^[\]]*[\uac00-\ud7af][^[\]]*\]', '', text)
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
            new_content = remove_hints(content)
            # Surgical fix for the user's specific example just in case
            new_content = new_content.replace('(일반적 냉장)', '')
            
            if new_content != content:
                print(f"Cleaning {filename} (using {used_encoding})...")
                with open(filepath, 'w', encoding=used_encoding) as f:
                    f.write(new_content)

print("Cleanup with multi-encoding support complete.")
