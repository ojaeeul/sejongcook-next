import os

filepath = 'public/sejong/student/login.js'
old_str = "const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000/api' : '../../api.php?board=sejong_';"
new_str = "const API_BASE = '/api/sejong';"

if os.path.exists(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if old_str in content:
        new_content = content.replace(old_str, new_str)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print("Patched login.js")

filepath = 'public/sejong/sms_v3.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Find any remaining 'http://localhost:8000/api' or similar in sms_v3.js
# Looks like sms_v3.js has something like:
# const fetchUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? `${API_BASE}/sms_history` : `${API_BASE}sms_history`;
pattern = re.compile(r"const fetchUrl = window\.location\.hostname === 'localhost' \|\| window\.location\.hostname === '127\.0\.0\.1'\s*\?\s*`\$\{API_BASE\}/sms_history`\s*:\s*`\$\{API_BASE\}sms_history`;")
content = pattern.sub("const fetchUrl = `${API_BASE}/sms_history`;", content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched sms_v3.js")

