import os
import re
import glob
import shutil

source_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong"
target_dirs = [
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public",
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/public",
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook_final_deploy/sejong"
]

files_to_copy = ["photo_admin.html", "photo_admin.js", "kiosk_admin.html", "kiosk_admin.js"]

for target_dir in target_dirs:
    if os.path.exists(target_dir):
        # 1. Copy the updated admin files
        for f in files_to_copy:
            shutil.copy(os.path.join(source_dir, f), os.path.join(target_dir, f))
            
        # 2. Add link to all HTML files in target_dir
        html_files = glob.glob(os.path.join(target_dir, "*.html"))
        nav_pattern = re.compile(r'(<a href="register\.html"[^>]*>수강생 등록</a>)')

        for file_path in html_files:
            # Skip photo_admin and kiosk_admin since they are already copied with correct links
            if os.path.basename(file_path) in ["photo_admin.html", "kiosk_admin.html"]:
                continue
                
            with open(file_path, "r", encoding="utf-8") as f:
                file_content = f.read()

            # Remove old photo_admin link if exists
            file_content = re.sub(r'\s*<a href="photo_admin\.html"[^>]*>수강생 얼굴 관리</a>', '', file_content)
            
            # Insert photo_admin link after register.html
            class_str = 'class="nav-item active"' if os.path.basename(file_path) == 'photo_admin.html' else 'class="nav-item"'
            insert_str = f'\\1\n                    <a href="photo_admin.html" id="navPhotoAdmin" {class_str}>수강생 얼굴 관리</a>'
            
            new_content = nav_pattern.sub(insert_str, file_content)

            if new_content != file_content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated {file_path}")

print("Sync complete")
