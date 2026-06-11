import os
import glob
import re

target_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
html_files = glob.glob(os.path.join(target_dir, "*.html"))

for file in html_files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()

    if 'id="navMobileApp"' in content and "stats.html" in content:
        match = re.search(r'<a[^>]*id="navMobileApp"[^>]*>.*?모바일 앱.*?</a>', content, re.DOTALL)
        if match:
            app_tag = match.group(0)
            content = content.replace(app_tag, "")
            
            stats_match = re.search(r'<a[^>]*href="stats.html"[^>]*>.*?통계 및 납부.*?</a>', content, re.DOTALL)
            if stats_match:
                stats_tag = stats_match.group(0)
                content = content.replace(stats_tag, stats_tag + "\n                    " + app_tag)
                
            with open(file, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {os.path.basename(file)}")

