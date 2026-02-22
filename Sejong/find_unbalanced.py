import json
import re

def is_unbalanced(s):
    if not isinstance(s, str): return False
    stack = []
    for char in s:
        if char == '(': stack.append('(')
        elif char == ')':
            if not stack: return True
            stack.pop()
    return len(stack) > 0

def find_unbalanced():
    with open('public/questions_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    unbalanced = []
    def walk(obj, path):
        if isinstance(obj, dict):
            for k, v in obj.items():
                walk(v, path + [k])
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                walk(v, path + [str(i)])
        elif isinstance(obj, str):
            if is_unbalanced(obj):
                unbalanced.append((path, obj))
    
    walk(data, [])
    return unbalanced

unbalanced_items = find_unbalanced()
print(f"Found {len(unbalanced_items)} unbalanced items.")
for path, text in unbalanced_items[:20]:
    print(f"{'.'.join(path)}: {text}")
