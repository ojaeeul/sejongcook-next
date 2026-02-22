
import json
import os

file_path = r'c:\Users\세종요리\Desktop\Sejong\public\questions_data.json'

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
else:
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            keys = list(data.keys())
            print(f"Total keys: {len(keys)}")
            print("Keys found:")
            for k in sorted(keys):
                print(f" - {k}: {len(data[k])} questions")
    except Exception as e:
        print(f"Error reading JSON: {e}")
