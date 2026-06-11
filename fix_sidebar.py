import os
import glob
import re

html_files = glob.glob("/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/*.html")

def fix_sidebar(content):
    # 1. "기타" 카테고리의 하위 메뉴 블록을 통째로 교체
    pattern_etc = re.compile(
        r'(<div class="nav-category toggle-category[^"]*" onclick="toggleNavSub\(this\)">기타</div>\s*<div class="nav-sub-menu[^"]*">).*?(</div>\s*<div class="nav-category toggle-category[^"]*" onclick="toggleNavSub\(this\)">학원문자</div>)',
        re.DOTALL
    )
    
    new_etc_content = r'''\1
                    <a href="class_days_admin.html" id="navClassDaysAdmin" class="nav-item">
                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">settings</span>
                        수업 요일 설정
                    </a>
                    <a href="course_time_admin.html" id="navCourseTimeAdmin" class="nav-item">
                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">list_alt</span>
                        과목/시간 설정
                    </a>
                    <a href="cycle_settings.html" id="navCycleSettings" class="nav-item">
                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">tune</span>
                        결재 주기 설정
                    </a>
                    <a href="index.html?filter=archive" id="navArchive" class="nav-item">수료생 보관함</a>
                    <a href="index.html?filter=trash" id="navTrash" class="nav-item">휴지통</a>
                    <a href="stats.html" class="nav-item">통계 및 납부</a>
                \2'''
    
    content = pattern_etc.sub(new_etc_content, content)
    
    # 2. 모바일 앱 태그를 기존 위치(있다면)에서 삭제하고 제일 밑으로 이동
    app_link = '<a href="app.html" id="navMobileApp" class="nav-item" target="_blank">📱 모바일 앱</a>'
    
    # 만약 이상한 위치에 앱 링크가 남아있으면 삭제
    content = content.replace(app_link, '')
    # 혹시 들여쓰기 포함된 것도 삭제
    content = re.sub(r'\s*<a href="app.html" id="navMobileApp"[^>]*>📱 모바일 앱</a>\s*', '\n', content)
    
    # nav 태그 닫히기 직전에 모바일 앱 추가
    pattern_end_nav = re.compile(r'(</nav>\s*</aside>)')
    content = pattern_end_nav.sub(f'    {app_link}\n            \\1', content)
    
    return content

count = 0
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = fix_sidebar(content)
    
    if content != new_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1

print(f"Updated {count} HTML files.")
