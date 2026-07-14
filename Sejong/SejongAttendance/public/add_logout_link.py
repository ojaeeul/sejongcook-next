import os
import glob

target_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
html_files = glob.glob(os.path.join(target_dir, "*.html"))

search_text = """<a href="admin_account.html" id="navAdminAccount" class="nav-item">아이디</a>"""
replace_text = """<a href="admin_account.html" id="navAdminAccount" class="nav-item">아이디</a>
                <a href="#" onclick="logoutAdmin(event)" class="nav-item" style="color: #ef4444;">
                    <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">logout</span>
                    로그아웃
                </a>"""

for file in html_files:
    with open(file, "r", encoding="utf-8") as f:
        content = f.read()
    
    if search_text in content and 'onclick="logoutAdmin(event)"' not in content:
        content = content.replace(search_text, replace_text)
        with open(file, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {os.path.basename(file)}")
