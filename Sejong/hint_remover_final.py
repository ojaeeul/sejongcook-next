import json
import re

def remove_hints_final(text):
    if not isinstance(text, str):
        return text
    
    # 1. First, surgically fix the specific corruption from the previous run
    # Pattern: text ending with something like +40.6, ... )
    # We look for a pattern that looks like a broken hint at the end
    # "기출문제? ... )" or similar
    text = re.sub(r'\?\+[\d.]+,[^?)]+\)$', '?', text)
    # Also handle cases where it might just be the trailing text without the + and numbers
    text = re.sub(r'[^?]+\(이것은[^)]+\)$', '', text) # Handle HACCP example
    text = re.sub(r'\[계산:.*?\]', '', text) # Handle bracketed math
    
    # 2. Broad hint removal (iterative to handle nesting)
    prev = ""
    while text != prev:
        prev = text
        # Remove (...) containing Korean but keep parenthetical abbreviations like (DI), (HTST), (Halal)
        # We define a hint as something longer or containing specific "hint" keywords
        # or just any parenthesis with Hangul if it's not a common abbreviation.
        # But actually, the user said "all hints", and usually abbreviations aren't considered hints.
        # However, to be safe, we remove any (...) that has more than 3 Korean characters.
        # Actually, let's stick to the user's examples: (일반적 냉장), (공식: ...), (식: ...), (계산: ...)
        
        # This regex matches (...) and [...] containing Hangul
        text = re.sub(r'\s?\([^()]*[\uac00-\ud7af][^()]*\)', '', text)
        text = re.sub(r'\s?\[[^[\]]*[\uac00-\ud7af][^[\]]*\]', '', text)

    return text.strip()

def process_file(filepath, is_js=False):
    print(f"Final Cleanup for {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    prefix = 'window.EXAM_DATA_DB = '
    if is_js:
        json_part = content[len(prefix):].rstrip('; \n\r')
        data = json.loads(json_part)
    else:
        data = json.loads(content)

    def walk(obj):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if isinstance(v, (dict, list)): walk(v)
                elif isinstance(v, str): obj[k] = remove_hints_final(v)
        elif isinstance(obj, list):
            for i in range(len(obj)):
                if isinstance(obj[i], (dict, list)): walk(obj[i])
                elif isinstance(obj[i], str): obj[i] = remove_hints_final(obj[i])

    walk(data)
    output_json = json.dumps(data, ensure_ascii=False, indent=2)
    with open(filepath, 'w', encoding='utf-8') as f:
        if is_js: f.write(prefix + output_json + ';')
        else: f.write(output_json)

process_file('public/questions_data.json')
process_file('public/questions_data.js', True)
print("Done.")
