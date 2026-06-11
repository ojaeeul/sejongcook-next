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

new_main = """        <main class="main-content">
<div style="padding: 20px; background: #f1f5f9; min-height: 100vh; display: flex; justify-content: center; align-items: flex-start;">
    <div class="settings-admin-container" style="width: 100%; max-width: 900px; background: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); padding: 40px; margin-top: 40px;">
        <h1 style="margin-top: 0; display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
            <span class="material-icons" style="color: #3b82f6; font-size: 32px;">tune</span> 결재 주기 설정
        </h1>
        
        <div style="margin-bottom: 20px; padding: 15px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; color: #1e40af; line-height: 1.5;">
            <span class="material-icons" style="vertical-align: middle; margin-right: 5px;">info</span>
            <strong>안내:</strong> 각 과정 이름에 특정 단어가 포함될 때 적용할 <strong>결재 주기(회차 기준)</strong>를 설정할 수 있습니다.<br>
            위에서부터 순서대로 적용되며, 매칭되는 키워드가 없으면 최하단의 '기본 결재 주기'가 적용됩니다.
        </div>

        <div style="margin-bottom: 30px; display: flex; gap: 10px; align-items: center; background: #f8fafc; padding: 15px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <input type="text" id="newKeyword" placeholder="적용할 과정 키워드 (예: 제과제빵)" style="flex: 1; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 1.05rem;">
            <input type="number" id="newCycle" placeholder="주기(회)" style="width: 100px; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 1.05rem; text-align: center;">
            <button onclick="addCustomRule()" style="padding: 12px 20px; border-radius: 8px; background: #10b981; color: white; border: none; font-weight: bold; font-size: 1.05rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                <span class="material-icons" style="font-size: 1.2rem;">add_circle</span> 추가
            </button>
        </div>

        <div id="rulesList" style="display: flex; flex-direction: column; gap: 15px;">
            <div style="text-align:center; padding:20px; color:#94a3b8;">데이터를 불러오는 중입니다...</div>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px dashed #e2e8f0;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                <div style="font-size: 1.2rem; font-weight: bold; color: #334155; margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                    <span class="material-icons" style="color:#64748b;">restaurant</span> 기본 결재 주기 (일반 과정)
                </div>
                <div style="color: #64748b;">위의 키워드에 해당하지 않는 나머지 모든 단일 과정에 적용됩니다.</div>
                <div style="display: flex; align-items: center; gap: 10px; margin-top: 15px;">
                    <span>출석 관련 데이터 누적</span>
                    <input type="number" id="defaultCycle" value="9" style="width: 80px; padding: 8px; font-size: 1.1rem; border: 1px solid #cbd5e1; border-radius: 6px; text-align: center;">
                    <span>회 마다 1주기(결재일) 발생</span>
                </div>
            </div>
        </div>

        <button onclick="saveCycleSettings()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 1.1rem; font-weight: bold; display: flex; align-items: center; gap: 8px; margin-top: 30px; float: right;">
            <span class="material-icons">save</span> 설정 저장 및 반영
        </button>
        <div style="clear: both;"></div>
    </div>
</div>
</main>

<script>
    let globalSettings = {};
    let cycleRules = {
        default: 9,
        custom: [
            { keyword: "제과제빵", cycle: 17 }
        ]
    };

    async function loadSettings() {
        try {
            const res = await fetch('/api/sejong/settings');
            if (res.ok) {
                globalSettings = await res.json();
                if (globalSettings.cycleRules) {
                    cycleRules = globalSettings.cycleRules;
                }
            }
            renderRules();
        } catch (e) {
            console.error('설정 로딩 실패:', e);
            document.getElementById('rulesList').innerHTML = '<div style="text-align:center; padding:20px; color:#ef4444;">설정을 불러오지 못했습니다.</div>';
        }
    }

    function renderRules() {
        document.getElementById('defaultCycle').value = cycleRules.default;
        const list = document.getElementById('rulesList');
        list.innerHTML = '';

        if (cycleRules.custom.length === 0) {
            list.innerHTML = '<div style="text-align:center; padding:20px; color:#94a3b8;">등록된 특별 키워드가 없습니다. 모든 과정이 기본 주기를 따릅니다.</div>';
            return;
        }

        cycleRules.custom.forEach((rule, index) => {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.justifyContent = 'space-between';
            row.style.background = '#fff';
            row.style.border = '1px solid #cbd5e1';
            row.style.padding = '15px 20px';
            row.style.borderRadius = '10px';
            
            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span style="font-weight: bold; font-size: 1.1rem; color: #0f172a;">${rule.keyword}</span>
                    <span style="color: #64748b;">포함 시</span>
                    <strong style="color: #3b82f6; font-size: 1.1rem;">${rule.cycle}회</strong> 주기 적용
                </div>
                <span class="material-icons" style="color: #ef4444; cursor: pointer;" title="삭제" onclick="deleteRule(${index})">delete_outline</span>
            `;
            list.appendChild(row);
        });
    }

    function addCustomRule() {
        const keyword = document.getElementById('newKeyword').value.trim();
        const cycle = parseInt(document.getElementById('newCycle').value, 10);

        if (!keyword) {
            alert('키워드를 입력해주세요.');
            return;
        }
        if (isNaN(cycle) || cycle < 1) {
            alert('올바른 주기(숫자)를 입력해주세요.');
            return;
        }

        const exists = cycleRules.custom.find(r => r.keyword === keyword);
        if (exists) {
            alert('이미 존재하는 키워드입니다.');
            return;
        }

        cycleRules.custom.push({ keyword, cycle });
        document.getElementById('newKeyword').value = '';
        document.getElementById('newCycle').value = '';
        renderRules();
    }

    function deleteRule(index) {
        if (confirm('이 키워드 규칙을 삭제하시겠습니까?')) {
            cycleRules.custom.splice(index, 1);
            renderRules();
        }
    }

    async function saveCycleSettings() {
        const defaultCycle = parseInt(document.getElementById('defaultCycle').value, 10);
        if (isNaN(defaultCycle) || defaultCycle < 1) {
            alert('기본 주기는 1 이상의 숫자여야 합니다.');
            return;
        }
        cycleRules.default = defaultCycle;
        
        globalSettings.cycleRules = cycleRules;
        
        try {
            const res = await fetch('/api/sejong/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(globalSettings)
            });
            if (res.ok) {
                alert('결재 주기 설정이 성공적으로 저장되었습니다.\\n이 변경 사항은 전체 출석부 계산 엔진에 즉시 반영됩니다.');
            } else {
                alert('저장에 실패했습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        }
    }

    window.addEventListener("DOMContentLoaded", () => {
        loadSettings();
    });
</script>
"""

# Strip any existing script related to cycle_settings or timetable that might have been carried over
html_content = re.sub(r'<script>\s*const SHEET_API_BASE = \'/api/sejong\';.*?</script>', '', html_content, flags=re.DOTALL)

# Also strip the toggleSidebar script if it was duplicated, but it's safe to just replace main
html_content = re.sub(r'<main class="main-content">.*?</main>', new_main, html_content, flags=re.DOTALL)

with open(target_file, 'w', encoding='utf-8') as f:
    f.write(html_content)
    
print("Successfully generated dynamic cycle_settings.html")
