import os
import shutil

source_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/sejong"
target_dirs = [
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public",
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/public",
    "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook_final_deploy/sejong"
]

files_to_sync = ["photo_edit.html", "photo_edit.js", "kiosk_admin.js"]

for target_dir in target_dirs:
    if os.path.exists(target_dir):
        for f in files_to_sync:
            shutil.copy(os.path.join(source_dir, f), os.path.join(target_dir, f))

print("Sync complete")
