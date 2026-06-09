import os
import re
import glob

base_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong"

# 1. Update photo_admin.html
with open(f"{base_dir}/photo_admin.html", "r", encoding="utf-8") as f:
    content = f.read()

# Change title
content = content.replace("키오스크 얼굴 출석 데이터 관리", "수강생 얼굴 관리")
content = content.replace("kiosk_admin.js?v=1", "photo_admin.js?v=1")
content = content.replace('<span class="material-icons" style="color: #3b82f6; font-size: 32px;">admin_panel_settings</span> 키오스크 관리자 시스템', '<span class="material-icons" style="color: #3b82f6; font-size: 32px;">face</span> 수강생 얼굴 관리')

# Remove tabs
content = re.sub(r'<div class="tabs">.*?</div>\s*<!-- Tab 1: Members -->', '', content, flags=re.DOTALL)
content = content.replace('id="tabMembers" class="tab-content active"', 'id="tabMembers" class="tab-content active" style="display:block;"')
content = re.sub(r'<!-- Tab 2: Settings -->.*?</div>\s*</div>\s*<!-- Webcam Capture Modal -->', '</div>\n\n    <!-- Webcam Capture Modal -->', content, flags=re.DOTALL)
# Make active in sidebar
content = content.replace('<a href="kiosk_admin.html" id="navKioskAdmin" class="nav-item active">키오스크 설정</a>', '<a href="kiosk_admin.html" id="navKioskAdmin" class="nav-item">키오스크 설정</a>')

with open(f"{base_dir}/photo_admin.html", "w", encoding="utf-8") as f:
    f.write(content)

# 2. Update kiosk_admin.html
with open(f"{base_dir}/kiosk_admin.html", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r'<div class="tabs">.*?</div>\s*<!-- Tab 1: Members -->', '<!-- Tab 2: Settings -->', content, flags=re.DOTALL)
content = re.sub(r'<div id="tabMembers" class="tab-content active">.*?<!-- Tab 2: Settings -->', '<!-- Tab 2: Settings -->', content, flags=re.DOTALL)
content = content.replace('id="tabSettings" class="tab-content"', 'id="tabSettings" class="tab-content active" style="display:block;"')
# Remove webcam modal
content = re.sub(r'<!-- Webcam Capture Modal -->.*?</canvas>', '', content, flags=re.DOTALL)

with open(f"{base_dir}/kiosk_admin.html", "w", encoding="utf-8") as f:
    f.write(content)

# 3. Add link to all HTML files
html_files = glob.glob(os.path.join(base_dir, "*.html"))
nav_pattern = re.compile(r'(<a href="register\.html"[^>]*>수강생 등록</a>)')

for file_path in html_files:
    with open(file_path, "r", encoding="utf-8") as f:
        file_content = f.read()

    file_content = re.sub(r'\s*<a href="photo_admin\.html"[^>]*>수강생 얼굴 관리</a>', '', file_content)
    
    class_str = 'class="nav-item active"' if os.path.basename(file_path) == 'photo_admin.html' else 'class="nav-item"'
    insert_str = f'\\1\n                    <a href="photo_admin.html" id="navPhotoAdmin" {class_str}>수강생 얼굴 관리</a>'
    
    new_content = nav_pattern.sub(insert_str, file_content)

    if new_content != file_content:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
