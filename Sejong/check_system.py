
import json
import os
import glob

def check_json_file(path):
    print(f"Checking {path}...")
    try:
        if not os.path.exists(path):
            print(f"  [WARN] File not found.")
            return
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
            if not content.strip():
                print("  [WARN] File is empty.")
                return
            json.loads(content)
        print("  [OK] Valid JSON.")
    except Exception as e:
        print(f"  [ERROR] {e}")

def check_js_data_file(path):
    print(f"Checking {path}...")
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        prefix = 'window.EXAM_DATA_DB = '
        if content.startswith(prefix):
            json_str = content[len(prefix):].strip().rstrip(';')
            try:
                json.loads(json_str)
                print("  [OK] Valid JS Data.")
            except json.JSONDecodeError as je:
                print(f"  [ERROR] JSON Decode Error: {je}")
                # Print around the error point
                err_pos = je.pos
                start = max(0, err_pos - 50)
                end = min(len(json_str), err_pos + 50)
                print(f"  Context: ...{json_str[start:end]}...")
        else:
            print("  [ERROR] Does not start with window.EXAM_DATA_DB =")
            # Try to see start
            print(f"  Start: {content[:50]}...")
            
    except Exception as e:
        print(f"  [ERROR] {e}")

if __name__ == "__main__":
    print("--- Checking Data Files ---")
    data_files = glob.glob('data/*.json')
    for f in data_files:
        check_json_file(f)
        
    print("\n--- Checking Questions Data ---")
    check_json_file('public/questions_data.json')
    check_js_data_file('public/questions_data.js')
