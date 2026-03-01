import json
import os
import re

def find_hints(text):
    if not isinstance(text, str): return []
    return re.findall(r'\([^()]*[\uac00-\ud7af][^()]*\)', text)

def scan_files():
    public_dir = 'public'
    for root, dirs, files in os.walk(public_dir):
        for file in files:
            if file.endswith(('.json', '.js', '.html')):
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        hints = find_hints(content)
                        if hints:
                            print(f"File: {filepath} - Found: {hints[:3]}...")
                except:
                    pass

scan_files()
