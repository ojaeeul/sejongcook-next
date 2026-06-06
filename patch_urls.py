import os
import re

dir_path = 'public/sejong/'

pattern = re.compile(r'function getFetchUrl\(endpoint, isPost = false\) \{.*?\n\}', re.DOTALL)

replacement = """function getFetchUrl(endpoint, isPost = false) {
    const url = `/api/sejong/${endpoint}`;
    return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
}"""

for filename in os.listdir(dir_path):
    if filename.endswith('.js'):
        filepath = os.path.join(dir_path, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content = pattern.sub(replacement, content)
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Patched {filename}")

