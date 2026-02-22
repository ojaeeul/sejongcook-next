
import json

file_path = r'c:\Users\세종요리\Desktop\Sejong\public\questions_data.js'

try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Strip prefix "window.EXAM_DATA_DB = " and suffix ";"
    json_str = content.replace('window.EXAM_DATA_DB = ', '').strip().rstrip(';')
    
    data = json.loads(json_str)
    print("questions_data.js contains valid JSON object.")
    print(f"Keys: {list(data.keys())}")
    
except Exception as e:
    print(f"Error parsing questions_data.js: {e}")
