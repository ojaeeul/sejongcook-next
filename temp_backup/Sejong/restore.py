import os
import shutil

src_dir = r"c:\Users\세종요리\Desktop\sejk 4\sejongcook-next\public\sejong"
dst_dir = r"c:\Users\세종요리\Desktop\sejk 4\sejongcook-next\Sejong\public"

for item in os.listdir(src_dir):
    src_path = os.path.join(src_dir, item)
    dst_path = os.path.join(dst_dir, item)
    
    # Exclude Wagashi updates as requested
    if item in ["wagashi.html", "wagashi.css"]:
        continue
        
    if os.path.isfile(src_path):
        shutil.copy2(src_path, dst_path)
        print(f"Copied {item}")
