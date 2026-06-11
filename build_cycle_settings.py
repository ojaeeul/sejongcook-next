import os
import re

dir_path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
source_file = os.path.join(dir_path, "class_days_admin.html")
target_file = os.path.join(dir_path, "cycle_settings.html")

with open(source_file, 'r', encoding='utf-8') as f:
    html_content = f.read()

# Replace the title
html_content = html_content.replace("<title>수업 요일 설정</title>", "<title>결재 주기 설정</title>")

# Make class_days_admin nav item NOT active, and make cycle_settings nav item active
html_content = html_content.replace(
    '<a href="class_days_admin.html" id="navClassDaysAdmin" class="nav-item active">',
    '<a href="class_days_admin.html" id="navClassDaysAdmin" class="nav-item">'
)
html_content = html_content.replace(
    '<a href="cycle_settings.html" id="navCycleSettings" class="nav-item">',
    '<a href="cycle_settings.html" id="navCycleSettings" class="nav-item active">'
)

# New Main Content
new_main = """        <main class="main-content">
<div style="padding: 20px; background: #f1f5f9; min-height: 100vh; display: flex; justify-content: center; align-items: flex-start;">
    <div class="settings-admin-container" style="width: 100%; max-width: 900px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); padding: 40px; margin-top: 40px;">
        <h1 style="margin-top: 0; display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
            <span class="material-icons" style="color: #3b82f6; font-size: 32px;">tune</span> 결재 주기 설정
        </h1>
        
        <div style="margin-bottom: 20px; padding: 15px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; color: #1e40af;">
            <span class="material-icons" style="vertical-align: middle; margin-right: 5px;">info</span>
            <strong>안내:</strong> 각 과정별로 출석 횟수에 따른 결재 주기(Red Box) 발생 기준을 설정합니다.<br>현재 이 값들은 시스템 전체 출석부 엔진(shared_calc.js)에 전역적으로 적용됩니다.
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="font-size: 1.2rem; font-weight: bold; color: #334155; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <span class="material-icons" style="color:#10b981;">restaurant</span> 일반 과정 (한식, 양식, 중식, 일식 등)
            </div>
            <div style="color: #64748b;">기본적으로 대부분의 단일 과정에 적용되는 출석 누적 주기입니다.</div>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 15px;">
                <span>출석 관련 데이터 누적</span>
                <input type="number" value="9" disabled style="width: 80px; padding: 8px; font-size: 1.1rem; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center;">
                <span>회 마다 1주기(결재일) 발생</span>
            </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <div style="font-size: 1.2rem; font-weight: bold; color: #334155; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                <span class="material-icons" style="color:#f59e0b;">bakery_dining</span> 제과제빵 (복합 과정)
            </div>
            <div style="color: #64748b;">'제과제빵' 단어가 포함된 복합 과정에 적용되는 특별 출석 누적 주기입니다.</div>
            <div style="display: flex; align-items: center; gap: 10px; margin-top: 15px;">
                <span>출석 관련 데이터 누적</span>
                <input type="number" value="17" disabled style="width: 80px; padding: 8px; font-size: 1.1rem; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center;">
                <span>회 마다 1주기(결재일) 발생</span>
            </div>
        </div>

        <button onclick="alert('현재 결재 주기는 학원 핵심 로직으로 고정(하드코딩)되어 보호받고 있습니다. 임의 변경을 원하실 경우 관리자에게 문의해주세요.')" 
                style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: bold; display: flex; align-items: center; gap: 8px; margin-top: 30px; float: right;">
            <span class="material-icons">lock</span> 설정 잠금 상태
        </button>
        <div style="clear: both;"></div>
    </div>
</div>
        </main>
"""

# Replace the main content
html_content = re.sub(r'<main class="main-content">.*?</main>', new_main, html_content, flags=re.DOTALL)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(html_content)
    
print("Successfully created cycle_settings.html with full sidebar and proper main content.")
