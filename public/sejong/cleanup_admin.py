import os
import glob
import re
import shutil

target_dirs = [
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong",
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public",
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/public",
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook_final_deploy/sejong"
]

files_to_remove = ["photo_admin.html", "photo_admin.js"]
source_dir = target_dirs[0]

for target_dir in target_dirs:
    if os.path.exists(target_dir):
        # 1. Remove photo_admin files
        for f in files_to_remove:
            file_path = os.path.join(target_dir, f)
            if os.path.exists(file_path):
                os.remove(file_path)
                
        # 2. Copy the RESTORED kiosk_admin files
        if target_dir != source_dir:
            shutil.copy(os.path.join(source_dir, "kiosk_admin.html"), os.path.join(target_dir, "kiosk_admin.html"))
            shutil.copy(os.path.join(source_dir, "kiosk_admin.js"), os.path.join(target_dir, "kiosk_admin.js"))

        # 3. Remove photo_admin link from all HTML files in target_dir
        html_files = glob.glob(os.path.join(target_dir, "*.html"))
        
        for file_path in html_files:
            with open(file_path, "r", encoding="utf-8") as f:
                file_content = f.read()

            # Remove old photo_admin link if exists
            new_content = re.sub(r'\n\s*<a href="photo_admin\.html"[^>]*>수강생 얼굴 관리</a>', '', file_content)

            if new_content != file_content:
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(new_content)

print("Cleanup complete")
