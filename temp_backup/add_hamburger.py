import os
import re

target_dir = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong'

files_to_update = [
    'tuition.html', 'ledger.html', 'stats.html', 'paid_list.html', 'feed.html', 'wagashi.html'
]

# Regex to safely inject the overlay
overlay_pattern = re.compile(r'(<div\s+class="app-container"\s*>)(?!\s*<!-- Mobile Sidebar Overlay)', re.IGNORECASE)
overlay_inject = r'\1\n        <!-- Mobile Sidebar Overlay -->\n        <div class="sidebar-overlay" onclick="toggleSidebar()"></div>'

# Regex to safely inject the hamburger button
header_pattern = re.compile(r'(<header\s+class="top-header"\s*>)(?!\s*<button\s+class="hamburger-btn")', re.IGNORECASE)
hamburger_inject = r'\1\n                <button class="hamburger-btn" onclick="toggleSidebar()">\n                    <span>MENU</span>\n                    <span class="material-icons">menu</span>\n                </button>'

for filename in files_to_update:
    filepath = os.path.join(target_dir, filename)
    if not os.path.exists(filepath):
        print(f"Skipping {filename} (Not found)")
        continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Process
    new_content = overlay_pattern.sub(overlay_inject, content, count=1)
    new_content = header_pattern.sub(hamburger_inject, new_content, count=1)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filename}")
    else:
        print(f"No changes needed for {filename}")

print("Done")
