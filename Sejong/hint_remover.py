import re
import json
import os

def remove_hints(text):
    if not isinstance(text, str):
        return text
    
    # 1. Parentheses containing Korean text (often explanatory)
    # Examples: (일반적 냉장), (숨이 죽음), (이것은 5단계...), (3등급)
    # We apply this to both cases with and without leading space.
    text = re.sub(r'\s?\([^)]*[\uac00-\ud7af][^)]*\)', '', text)
    
    # 2. Square brackets containing hints like [계산: ...] or [공식: ...]
    text = re.sub(r'\s?\[[^\]]*[\uac00-\ud7af][^\]]*\]', '', text)
    
    # 3. Trailing space cleanup
    text = text.strip()
    
    return text

def process_data(data):
    if isinstance(data, dict):
        for k, v in data.items():
            if isinstance(v, (dict, list)):
                process_data(v)
            elif isinstance(v, str):
                data[k] = remove_hints(v)
    elif isinstance(data, list):
        for i in range(len(data)):
            if isinstance(data[i], (dict, list)):
                process_data(data[i])
            elif isinstance(data[i], str):
                data[i] = remove_hints(data[i])

def process_file(filepath, is_js=False):
    print(f"Processing {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if is_js:
        prefix = 'window.EXAM_DATA_DB = '
        if content.startswith(prefix):
            json_part = content[len(prefix):].rstrip('; \n\r')
            try:
                data = json.loads(json_part)
                process_data(data)
                output_json = json.dumps(data, ensure_ascii=False, indent=2)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(prefix + output_json + ';')
            except Exception as e:
                print(f"Error parsing JS: {e}")
    else:
        try:
            data = json.loads(content)
            process_data(data)
            output_json = json.dumps(data, ensure_ascii=False, indent=2)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(output_json)
        except Exception as e:
            print(f"Error parsing JSON: {e}")

# Target files
process_file('public/questions_data.json')
process_file('public/questions_data.js', True)

print("Hint removal complete.")
