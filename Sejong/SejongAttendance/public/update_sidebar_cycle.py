import os

path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/cycle_settings.html"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the start of the bottom section
start_marker = '<div class="nav-divider"></div>'
end_marker = '</nav>'

if start_marker in content and end_marker in content:
    pre = content.split(start_marker)[0]
    post = content.split(end_marker)[1]
    
    new_bottom = """<div class="nav-divider"></div>
            
            <a href="board.html" class="nav-item">
                <span class="material-icons">campaign</span> 학원 공지
            </a>
            <div style="font-weight: bold; color: #94a3b8; font-size: 0.85rem; padding: 15px 20px 5px 20px;">기타</div>
            <a href="class_days_admin.html" class="nav-item">
                <span class="material-icons">schedule</span> 수업 요일 설정
            </a>
            <a href="course_time_admin.html" class="nav-item">
                <span class="material-icons">list_alt</span> 과목/시간 설정
            </a>
            <a href="cycle_settings.html" class="nav-item active">
                <span class="material-icons">tune</span> 결재 주기 설정
            </a>
            <a href="archive.html" class="nav-item">
                <span class="material-icons">inventory_2</span> 수료생 보관함
            </a>
            <a href="trash.html" class="nav-item">
                <span class="material-icons">delete</span> 휴지통
            </a>
            <a href="stats.html" class="nav-item">
                <span class="material-icons">bar_chart</span> 통계 및 납부
            </a>
            <a href="app.html" target="_blank" class="nav-item" style="margin-top: 10px; color: #3b82f6; font-weight: bold;">
                📱 모바일 앱
            </a>
        """
    
    # Wait, 'stats.html' is currently ABOVE the divider!
    # I should remove 'stats.html' from above the divider so it doesn't duplicate.
    
    # Let's fix the whole nav area
    nav_start = '<nav class="sidebar-nav">'
    
    with open(path, 'w', encoding='utf-8') as f:
        pass
