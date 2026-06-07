import re
import os

with open("tuition.html", "r", encoding="utf-8") as f:
    tuition = f.read()

sidebar_match = re.search(r'<div class="app-container">.*?<main class="main-content">', tuition, re.DOTALL)
if not sidebar_match:
    print("Sidebar not found")
    exit(1)

sidebar_html = sidebar_match.group(0)

# Make the settings menu active
sidebar_html = sidebar_html.replace(
    '<a href="javascript:void(0)" onclick="openSettingsModal()" class="nav-item">\n                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">settings</span>\n                        수업 요일 설정\n                    </a>',
    '<a href="class_days_admin.html" id="navClassDaysAdmin" class="nav-item active">\n                        <span class="material-icons" style="font-size: 1.2rem; margin-right: 8px;">settings</span>\n                        수업 요일 설정\n                    </a>'
)

template = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>수업 요일 설정</title>
    <link rel="stylesheet" href="style.css">
    <script src="tuition_v4.js" defer></script>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <style>
        .settings-admin-container {
            width: 100%;
            max-width: 900px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            padding: 40px;
            margin-top: 40px;
            margin-bottom: 40px;
        }
        h1 {
            margin-top: 0;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .course-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px 0;
            border-bottom: 1px dashed #eee;
        }
        .course-row:last-child {
            border-bottom: none;
        }
        .course-name {
            font-weight: 700;
            font-size: 1.1rem;
            width: 250px;
            color: #334155;
        }
        .days-toggles {
            display: flex;
            gap: 10px;
        }
        .day-toggle {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            user-select: none;
            transition: all 0.2s;
            color: #64748b;
            background: white;
        }
        .day-toggle.selected {
            background: #3b82f6;
            color: white;
            border-color: #3b82f6;
            box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
        }
        .day-toggle:hover {
            border-color: #94a3b8;
        }
        .btn-save {
            background: #3b82f6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.1rem;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 30px;
            float: right;
        }
        .btn-save:hover {
            background: #2563eb;
        }
        .settings-notice {
            margin-bottom: 20px; 
            padding: 15px; 
            background: #eff6ff; 
            border: 1px solid #bfdbfe; 
            border-radius: 10px; 
            color: #1e40af;
        }
    </style>
</head>
<body>
""" + sidebar_html + """
<div style="padding: 20px; background: #f1f5f9; min-height: 100vh; display: flex; justify-content: center; align-items: flex-start;">
    <div class="settings-admin-container">
        <h1><span class="material-icons" style="color: #3b82f6; font-size: 32px;">event_note</span> 수업 요일 설정</h1>
        
        <div class="settings-notice">
            <span class="material-icons" style="vertical-align: middle; margin-right: 5px;">info</span>
            <strong>안내:</strong> 각 과정별로 정해진 수업 요일을 선택해주세요. 선택된 요일에만 출석부 입력란이 활성화됩니다.
        </div>

        <div id="courseSettingsList">
            <div style="text-align:center; padding:40px; color:#94a3b8;">데이터를 불러오는 중입니다...</div>
        </div>
        
        <button class="btn-save" onclick="saveSettings()">
            <span class="material-icons">save</span> 설정 저장하기
        </button>
        <div style="clear: both;"></div>
    </div>
</div>
</main>
</div>

<!-- Scripts -->
<script>
    const SHEET_API_BASE = "http://localhost:3000/api";
    let timetableData = {};

    async function fetchTimetable() {
        try {
            const res = await fetch(`${SHEET_API_BASE}/timetable`);
            if (res.ok) {
                timetableData = await res.json();
                renderCourseSettings();
            }
        } catch (e) {
            console.error('Failed to fetch timetable:', e);
            document.getElementById('courseSettingsList').innerHTML = '<div style="text-align:center; padding:40px; color:#ef4444;">데이터를 불러오는데 실패했습니다. 서버가 실행 중인지 확인해주세요.</div>';
        }
    }

    function renderCourseSettings() {
        const container = document.getElementById('courseSettingsList');
        if (!container) return;
        container.innerHTML = '';

        const courses = Object.keys(timetableData);
        if (courses.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">등록된 과정이 없습니다.</div>';
            return;
        }

        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

        courses.forEach(course => {
            const row = document.createElement('div');
            row.className = 'course-row';

            const name = document.createElement('div');
            name.className = 'course-name';
            name.textContent = course;
            row.appendChild(name);

            const toggles = document.createElement('div');
            toggles.className = 'days-toggles';

            // 월(1) ~ 토(6)
            for (let i = 1; i <= 6; i++) {
                const btn = document.createElement('div');
                btn.className = 'day-toggle';
                if (timetableData[course] && timetableData[course].includes(i)) {
                    btn.classList.add('selected');
                }
                btn.textContent = dayNames[i];
                btn.onclick = () => {
                    btn.classList.toggle('selected');
                };
                btn.dataset.day = i;
                toggles.appendChild(btn);
            }
            row.appendChild(toggles);
            container.appendChild(row);
        });
    }

    async function saveSettings() {
        const newTimetable = {};
        const rows = document.querySelectorAll('.course-row');
        rows.forEach(row => {
            const course = row.querySelector('.course-name').textContent;
            const activeDays = [];
            row.querySelectorAll('.day-toggle.selected').forEach(btn => {
                activeDays.push(parseInt(btn.dataset.day));
            });
            newTimetable[course] = activeDays;
        });

        try {
            const res = await fetch(`${SHEET_API_BASE}/timetable`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTimetable)
            });
            if (res.ok) {
                timetableData = newTimetable;
                // [즉각 동기화] 다른 탭에 설정 변경 알림
                localStorage.setItem('sejong_timetable_sync', Date.now());
                alert('설정이 성공적으로 저장되었습니다.');
            } else {
                alert('저장에 실패했습니다.');
            }
        } catch (e) {
            console.error(e);
            alert('오류가 발생했습니다.');
        }
    }

    // Initialize
    window.addEventListener("DOMContentLoaded", () => {
        fetchTimetable();
    });

    // Handle sync from other tabs
    window.addEventListener('storage', (e) => {
        if (e.key === 'sejong_timetable_sync') {
            fetchTimetable();
        }
    });
</script>
</body>
</html>"""

with open("class_days_admin.html", "w", encoding="utf-8") as f:
    f.write(template)

print("Created class_days_admin.html")
