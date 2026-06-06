import os

dir_path = 'public/sejong/'
old_str = "const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000/api' : '../api.php?board=sejong_';"
new_str = "const API_BASE = '/api/sejong';"

for filename in os.listdir(dir_path):
    if filename.endswith('.js'):
        filepath = os.path.join(dir_path, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if old_str in content:
            new_content = content.replace(old_str, new_str)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Patched {filename}")
