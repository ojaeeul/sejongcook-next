import os
import re

def remove_hints(text):
    if not isinstance(text, str): return text
    # Robust cleanup
    # Matches (hint), [hint], （hint）, ［hint］ where hint contains Korean
    import re
    # Match any content inside brackets/parens that has at least one Hangul char
    # We use non-greedy matching .*?
    # Parens: ( ... )
    text = re.sub(r'\s?\([^()]*[\uac00-\ud7af][^()]*\)', '', text)
    # Full-width parens: （ ... ）
    text = re.sub(r'\s?\uff08[^\uff08\uff09]*[\uac00-\ud7af][^\uff08\uff09]*\uff09', '', text)
    # Brackets: [ ... ]
    text = re.sub(r'\s?\[[^[\]]*[\uac00-\ud7af][^[\]]*\]', '', text)
    
    # Specific manual case reported by user
    text = text.replace('(일반적 냉장)', '')
    text = text.replace('（일반적 냉장）', '')
    
    return text

public_dir = 'public'
for filename in os.listdir(public_dir):
    # Process only real files, ignore AppleDouble dot-underscore files
    if filename.endswith(('.html', '.js', '.json')) and not filename.startswith('._'):
        filepath = os.path.join(public_dir, filename)
        
        content = None
        encoding_to_use = 'utf-8' # Default
        
        # Try UTF-8 first
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                encoding_to_use = 'utf-8'
        except:
            # Fallback to cp949 for Korean Windows environments if UTF-8 fails
            try:
                with open(filepath, 'r', encoding='cp949') as f:
                    content = f.read()
                    encoding_to_use = 'cp949'
            except:
                continue
                
        if content:
            new_content = remove_hints(content)
            if new_content != content:
                print(f"Updating: {filename}")
                with open(filepath, 'w', encoding=encoding_to_use) as f:
                    f.write(new_content)

print("Cleanup script finished.")
