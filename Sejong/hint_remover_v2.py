import json
import re
import os

def remove_hints_robust(text):
    if not isinstance(text, str):
        return text
    
    # Correctly identify and remove hints iteratively to handle nesting
    # We remove (...) and [...] only if they contain Korean characters.
    
    # First, handle the corrupted leftovers from the previous run (those missing the opening parenthesis)
    # Pattern: something like ...?+40.6, ...)
    # If we find a ')' that doesn't have a matching '(', and it contains Korean, we should clean it up.
    
    # Recursive/Iterative approach for balanced parentheses
    prev = ""
    while text != prev:
        prev = text
        # Remove innermost (...) if they contain Korean
        text = re.sub(r'\s?\([^()]*[\uac00-\ud7af][^()]*\)', '', text)
        # Remove innermost [...] if they contain Korean
        text = re.sub(r'\s?\[[^[\]]*[\uac00-\ud7af][^[\]]*\]', '', text)

    # Clean up any leftover unbalanced closing parens that contain Korean/explanatory text 
    # (these were likely created by the previous bug)
    # Pattern: Any sequence of characters following a ? or . that ends in ) and has Korean but no (
    if ')' in text and '(' not in text:
        if any(u'\uac00' <= c <= u'\ud7af' for c in text.split('?')[-1]):
             text = re.sub(r'[^?]*[\uac00-\ud7af][^?]*\)', '', text)

    return text.strip()

def process_data(data):
    if isinstance(data, dict):
        for k, v in data.items():
            if isinstance(v, (dict, list)):
                process_data(v)
            elif isinstance(v, str):
                data[k] = remove_hints_robust(v)
    elif isinstance(data, list):
        for i in range(len(data)):
            if isinstance(data[i], (dict, list)):
                process_data(data[i])
            elif isinstance(data[i], str):
                data[i] = remove_hints_robust(data[i])

def process_file(filepath, is_js=False):
    print(f"Processing {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    data = None
    prefix = 'window.EXAM_DATA_DB = '
    if is_js:
        if content.startswith(prefix):
            json_part = content[len(prefix):].rstrip('; \n\r')
            try:
                data = json.loads(json_part)
            except Exception as e:
                print(f"Error parsing JS: {e}")
    else:
        try:
            data = json.loads(content)
        except Exception as e:
            print(f"Error parsing JSON: {e}")

    if data:
        process_data(data)
        output_json = json.dumps(data, ensure_ascii=False, indent=2)
        with open(filepath, 'w', encoding='utf-8') as f:
            if is_js:
                f.write(prefix + output_json + ';')
            else:
                f.write(output_json)

# Final run
process_file('public/questions_data.json')
process_file('public/questions_data.js', True)

print("Robust hint removal and fix complete.")
