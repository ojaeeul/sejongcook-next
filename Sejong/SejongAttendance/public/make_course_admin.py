import os

with open("class_days_admin.html", "r", encoding="utf-8") as f:
    html = f.read()

sidebar_start = html.find('<aside class="sidebar">')
sidebar_end = html.find('</aside>') + len('</aside>')
sidebar = html[sidebar_start:sidebar_end]

head_start = html.find('<head>')
head_end = html.find('</head>') + len('</head>')
head = html[head_start:head_end]

options_hour = "".join([f'<option value="{str(h).zfill(2)}">{str(h).zfill(2)}시</option>' for h in range(1, 25)])
options_minute = "".join([f'<option value="{str(m).zfill(2)}">{str(m).zfill(2)}분</option>' for m in range(0, 60, 5)])

new_html = f"""<!DOCTYPE html>
<html lang="ko">
{head}
<body class="dashboard-body">
    <!-- Top Navbar (Mobile) -->
    <div class="top-navbar">
        <button class="menu-toggle" onclick="toggleSidebar()">
            <span class="material-icons">menu</span>
        </button>
        <div class="top-nav-logo">과목/시간 설정</div>
        <div style="width: 24px;"></div>
    </div>
    <div class="sidebar-overlay" onclick="toggleSidebar()"></div>
    <div class="app-container">
        {sidebar}
        <main class="main-content">
            <header class="main-header">
                <div class="page-title-container">
                    <h1 class="page-title-text" style="color: #1e3a8a;">과목 및 시간 설정</h1>
                    <span style="font-size: 0.9rem; color: #64748b; margin-left: 15px; background: #f1f5f9; padding: 4px 10px; border-radius: 6px;">수강생 등록 시 선택할 수 있는 과목과 시간을 관리합니다.</span>
                </div>
            </header>

            <div class="content-body" style="padding-top: 20px; display: flex; flex-direction: column; gap: 20px;">
                <!-- Course List Settings -->
                <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                    <h2 style="font-size: 1.1rem; color: #1e293b; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        <span class="material-icons" style="color: #3b82f6;">book</span> 수강 과목 관리
                    </h2>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <input type="text" id="newCourseName" placeholder="추가할 과목명 (예: 바리스타 과정)" style="flex: 1; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1rem;">
                        <button onclick="addCourse()" style="background: #3b82f6; color: white; border: none; padding: 0 20px; border-radius: 6px; cursor: pointer; font-weight: bold; white-space: nowrap;">과목 추가</button>
                    </div>
                    <div id="courseListContainer" style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <!-- Courses will be rendered here -->
                    </div>
                </div>

                <!-- Time List Settings -->
                <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                    <h2 style="font-size: 1.1rem; color: #1e293b; margin-bottom: 15px; display: flex; align-items: center; gap: 8px;">
                        <span class="material-icons" style="color: #10b981;">schedule</span> 수업 시간 관리
                    </h2>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px; align-items: center;">
                        <select id="newTimeHour" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1rem; width: 100px;">
                            {options_hour}
                        </select>
                        <span style="font-weight: bold;">:</span>
                        <select id="newTimeMinute" style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 1rem; width: 100px;">
                            {options_minute}
                        </select>
                        <button onclick="addTime()" style="background: #10b981; color: white; border: none; padding: 0 20px; border-radius: 6px; cursor: pointer; font-weight: bold; white-space: nowrap;">시간 추가</button>
                    </div>
                    <div id="timeListContainer" style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <!-- Times will be rendered here -->
                    </div>
                </div>

                <!-- Save Action -->
                <div style="text-align: right;">
                    <button onclick="saveSettings()" style="background: #1e3a8a; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1.1rem; display: inline-flex; align-items: center; gap: 8px;">
                        <span class="material-icons">save</span> 설정 저장하기
                    </button>
                </div>
            </div>
        </main>
    </div>

    <script>
        const DEFAULT_COURSES = ["한식기능사", "양식기능사", "일식기능사", "중식기능사", "제과기능사", "제빵기능사", "제과제빵기능사", "복어기능사", "산업기사", "가정요리", "브런치"];
        const DEFAULT_TIMES = ["10:00", "12:00", "17:00", "19:00"];
        
        let courses = [];
        let times = [];

        async function loadSettings() {{
            try {{
                const res = await fetch("/api/sejong/settings");
                const data = await res.json();
                
                let settings = Array.isArray(data) && data.length > 0 ? data[0] : (data.key === "settings" ? data.value : data);
                
                courses = settings.courses && settings.courses.length > 0 ? settings.courses : [...DEFAULT_COURSES];
                times = settings.times && settings.times.length > 0 ? settings.times : [...DEFAULT_TIMES];
                
                renderCourses();
                renderTimes();
            }} catch (e) {{
                console.error("Failed to load settings", e);
                courses = [...DEFAULT_COURSES];
                times = [...DEFAULT_TIMES];
                renderCourses();
                renderTimes();
            }}
        }}

        function renderCourses() {{
            const container = document.getElementById("courseListContainer");
            container.innerHTML = "";
            courses.forEach((course, idx) => {{
                const tag = document.createElement("div");
                tag.style.cssText = "background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 20px; display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 0.95rem; color: #334155;";
                tag.innerHTML = `
                    ${{course}}
                    <span class="material-icons" style="font-size: 1.1rem; cursor: pointer; color: #ef4444;" onclick="removeCourse(${{idx}})">cancel</span>
                `;
                container.appendChild(tag);
            }});
        }}

        function addCourse() {{
            const input = document.getElementById("newCourseName");
            const val = input.value.trim();
            if (!val) return alert("과목명을 입력하세요.");
            if (courses.includes(val)) return alert("이미 등록된 과목입니다.");
            courses.push(val);
            input.value = "";
            renderCourses();
        }}

        function removeCourse(idx) {{
            courses.splice(idx, 1);
            renderCourses();
        }}

        function renderTimes() {{
            times.sort((a, b) => {{
                const [ah, am] = a.split(":").map(Number);
                const [bh, bm] = b.split(":").map(Number);
                if (ah !== bh) return ah - bh;
                return am - bm;
            }});

            const container = document.getElementById("timeListContainer");
            container.innerHTML = "";
            times.forEach((time, idx) => {{
                const tag = document.createElement("div");
                tag.style.cssText = "background: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px 12px; border-radius: 20px; display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 0.95rem; color: #065f46;";
                tag.innerHTML = `
                    <span class="material-icons" style="font-size: 1.1rem;">schedule</span>
                    ${{time}}
                    <span class="material-icons" style="font-size: 1.1rem; cursor: pointer; color: #ef4444;" onclick="removeTime(${{idx}})">cancel</span>
                `;
                container.appendChild(tag);
            }});
        }}

        function addTime() {{
            const h = document.getElementById("newTimeHour").value;
            const m = document.getElementById("newTimeMinute").value;
            const val = `${{h}}:${{m}}`;
            if (times.includes(val)) return alert("이미 등록된 시간입니다.");
            times.push(val);
            renderTimes();
        }}

        function removeTime(idx) {{
            times.splice(idx, 1);
            renderTimes();
        }}

        async function saveSettings() {{
            try {{
                const res = await fetch("/api/sejong/settings");
                const data = await res.json();
                
                let settingsArr = Array.isArray(data) && data.length > 0 ? data : [data.key === "settings" ? data.value : data];
                let settingsObj = settingsArr[0] || {{ id: Date.now().toString() }};
                
                settingsObj.courses = courses;
                settingsObj.times = times;
                settingsObj.courseFees = settingsObj.courseFees || {{}};
                
                courses.forEach(course => {{
                    if (settingsObj.courseFees[course] === undefined) {{
                        settingsObj.courseFees[course] = 200000;
                    }}
                }});

                const saveRes = await fetch("/api/sejong/settings", {{
                    method: "POST",
                    headers: {{ "Content-Type": "application/json" }},
                    body: JSON.stringify([settingsObj])
                }});
                
                if (saveRes.ok) {{
                    alert("설정이 성공적으로 저장되었습니다!");
                }} else {{
                    alert("설정 저장에 실패했습니다.");
                }}
            }} catch (e) {{
                console.error("Save error", e);
                alert("서버 오류가 발생했습니다.");
            }}
        }}

        document.addEventListener("DOMContentLoaded", loadSettings);

        window.toggleSidebar = function () {{
            const sidebar = document.querySelector(".sidebar");
            const overlay = document.querySelector(".sidebar-overlay");
            if (sidebar) sidebar.classList.toggle("active");
            if (overlay) overlay.classList.toggle("active");
        }};
        
        document.querySelectorAll(".nav-item").forEach(item => {{
            if (item.getAttribute("href") === "course_time_admin.html") {{
                item.classList.add("highlight");
                let parentMenu = item.closest(".nav-sub-menu");
                if (parentMenu) {{
                    parentMenu.classList.add("show");
                    if (parentMenu.previousElementSibling) {{
                        parentMenu.previousElementSibling.classList.add("active");
                    }}
                }}
            }}
        }});
    </script>
</body>
</html>
"""

with open("course_time_admin.html", "w", encoding="utf-8") as f:
    f.write(new_html)
