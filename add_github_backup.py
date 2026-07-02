import os
import re

target_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
link_str = '<a href="https://github.com/ojaeeul/sejongcook-next/archive/refs/heads/main.zip" class="nav-item">깃허브 백업 다운로드</a>'

# kiosk_admin.html을 가리키는 <a> 태그를 찾아 바로 뒤에 추가
pattern = re.compile(r'(<a href="kiosk_admin\.html"[^>]*>키오스크 설정</a>)')

updated_count = 0

for filename in os.listdir(target_dir):
    if filename.endswith(".html"):
        filepath = os.path.join(target_dir, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            # 이미 있으면 스킵
            if '깃허브 백업 다운로드' in content:
                continue
                
            new_content = pattern.sub(f'\\1\n                {link_str}', content)
            
            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                updated_count += 1
                print(f"Updated: {filename}")
        except Exception as e:
            print(f"Error processing {filename}: {e}")

print(f"\nTotal files updated: {updated_count}")
