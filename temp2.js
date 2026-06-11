    
        const DEFAULT_COURSES = ["한식기능사", "양식기능사", "일식기능사", "중식기능사", "제과기능사", "제빵기능사", "제과제빵기능사", "복어기능사", "산업기사", "가정요리", "브런치"];
        const DEFAULT_TIMES = ["10:00", "12:00", "17:00", "19:00"];
        
        let courses = [];
        let times = [];
        let makeupCutoffs = {};
        let attendanceCutoffs = {};

        async function loadSettings() {
            try {
                const res = await fetch("/api/sejong/settings");
                const data = await res.json();
                
                let settings = Array.isArray(data) && data.length > 0 ? data[0] : (data.key === "settings" ? data.value : data);
                
                courses = settings.courses && settings.courses.length > 0 ? settings.courses : [...DEFAULT_COURSES];
                times = settings.times && settings.times.length > 0 ? settings.times : [...DEFAULT_TIMES];
                makeupCutoffs = settings.makeupCutoffs || {};
                attendanceCutoffs = settings.attendanceCutoffs || {};
                
                renderCourses();
                renderTimes();
                renderCutoffs();
                renderAttendanceCutoffs();
            } catch (e) {
                console.error("Failed to load settings", e);
                courses = [...DEFAULT_COURSES];
                times = [...DEFAULT_TIMES];
                makeupCutoffs = {};
                attendanceCutoffs = {};
                renderCourses();
                renderTimes();
                renderCutoffs();
                renderAttendanceCutoffs();
            }
        }

        function renderCourses() {
            const container = document.getElementById("courseListContainer");
            container.innerHTML = "";
            courses.forEach((course, idx) => {
                const tag = document.createElement("div");
                tag.style.cssText = "background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 20px; display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 0.95rem; color: #334155;";
                tag.innerHTML = `
                    ${course}
                    <span class="material-icons" style="font-size: 1.1rem; cursor: pointer; color: #ef4444;" onclick="removeCourse(${idx})">cancel</span>
                `;
                container.appendChild(tag);
            });
        }

        function addCourse() {
            const input = document.getElementById("newCourseName");
            const val = input.value.trim();
            if (!val) return alert("과목명을 입력하세요.");
            if (courses.includes(val)) return alert("이미 등록된 과목입니다.");
            courses.push(val);
            input.value = "";
            renderCourses();
            renderCutoffs();
            renderAttendanceCutoffs();
        }

        function removeCourse(idx) {
            courses.splice(idx, 1);
            renderCourses();
            renderCutoffs();
            renderAttendanceCutoffs();
        }

        function renderTimes() {
            times.sort((a, b) => {
                const [ah, am] = a.split(":").map(Number);
                const [bh, bm] = b.split(":").map(Number);
                if (ah !== bh) return ah - bh;
                return am - bm;
            });

            const container = document.getElementById("timeListContainer");
            container.innerHTML = "";
            times.forEach((time, idx) => {
                const tag = document.createElement("div");
                tag.style.cssText = "background: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px 12px; border-radius: 20px; display: flex; align-items: center; gap: 8px; font-weight: 500; font-size: 0.95rem; color: #065f46;";
                tag.innerHTML = `
                    <span class="material-icons" style="font-size: 1.1rem;">schedule</span>
                    ${time}
                    <span class="material-icons" style="font-size: 1.1rem; cursor: pointer; color: #ef4444;" onclick="removeTime(${idx})">cancel</span>
                `;
                container.appendChild(tag);
            });
        }

        function addTime() {
            const h = document.getElementById("newTimeHour").value;
            const m = document.getElementById("newTimeMinute").value;
            const val = `${h}:${m}`;
            if (times.includes(val)) return alert("이미 등록된 시간입니다.");
            times.push(val);
            renderTimes();
        }

        function removeTime(idx) {
            times.splice(idx, 1);
            renderTimes();
        }

        function renderCutoffs() {
            const container = document.getElementById("cutoffListContainer");
            container.innerHTML = "";
            courses.forEach(course => {
                const isDual = course.includes("제과제빵");
                let defaultVal = isDual ? 16 : 8;
                if (makeupCutoffs[course] === undefined) {
                    makeupCutoffs[course] = defaultVal;
                }
                const val = makeupCutoffs[course];
                
                const badge = document.createElement("div");
                badge.style.cssText = "background: #fffbeb; border: 1px solid #fde68a; padding: 6px 12px; border-radius: 12px; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); transition: all 0.2s;";
                badge.innerHTML = `
                    <span style="font-weight: 600; color: #92400e; font-size: 0.9rem;">${course}</span>
                    <div style="display: flex; align-items: center; background: white; border-radius: 6px; padding: 2px 6px; border: 1px solid #fcd34d;">
                        <input type="number" value="${val}" style="width: 36px; border: none; outline: none; text-align: center; font-size: 0.95rem; font-weight: bold; color: #b45309; background: transparent;" onchange="updateCutoff('${course}', this.value)">
                        <span style="color: #d97706; font-size: 0.85rem; margin-left: 2px; font-weight: 500;">회</span>
                    </div>
                `;
                container.appendChild(badge);
            });
        }

        window.updateCutoff = function(course, val) {
            const num = Number(val);
            if (!isNaN(num) && num > 0) {
                makeupCutoffs[course] = num;
                saveSettings();
            }
        };

        function renderAttendanceCutoffs() {
            const container = document.getElementById("attendanceCutoffListContainer");
            container.innerHTML = "";
            courses.forEach(course => {
                const isDual = course.includes("제과제빵");
                let defaultVal = isDual ? 16 : 8;
                if (attendanceCutoffs[course] === undefined) {
                    attendanceCutoffs[course] = defaultVal;
                }
                const val = attendanceCutoffs[course];
                
                const badge = document.createElement("div");
                badge.style.cssText = "background: #eff6ff; border: 1px solid #bfdbfe; padding: 6px 12px; border-radius: 12px; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.02); transition: all 0.2s;";
                badge.innerHTML = `
                    <span style="font-weight: 600; color: #1e3a8a; font-size: 0.9rem;">${course}</span>
                    <div style="display: flex; align-items: center; background: white; border-radius: 6px; padding: 2px 6px; border: 1px solid #93c5fd;">
                        <input type="number" value="${val}" style="width: 36px; border: none; outline: none; text-align: center; font-size: 0.95rem; font-weight: bold; color: #1d4ed8; background: transparent;" onchange="updateAttendanceCutoff('${course}', this.value)">
                        <span style="color: #2563eb; font-size: 0.85rem; margin-left: 2px; font-weight: 500;">회</span>
                    </div>
                `;
                container.appendChild(badge);
            });
        }

        window.updateAttendanceCutoff = function(course, val) {
            const num = Number(val);
            if (!isNaN(num) && num > 0) {
                attendanceCutoffs[course] = num;
                saveSettings();
            }
        };

        async function saveSettings() {
            try {
                const res = await fetch("/api/sejong/settings");
                const data = await res.json();
                
                let settingsArr = Array.isArray(data) && data.length > 0 ? data : [data.key === "settings" ? data.value : data];
                let settingsObj = settingsArr[0] || { id: Date.now().toString() };
                
                settingsObj.courses = courses;
                settingsObj.times = times;
                settingsObj.makeupCutoffs = makeupCutoffs;
                settingsObj.courseFees = settingsObj.courseFees || {};
                
                courses.forEach(course => {
                    if (settingsObj.courseFees[course] === undefined) {
                        settingsObj.courseFees[course] = 200000;
                    }
                });

                const saveRes = await fetch("/api/sejong/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify([settingsObj])
                });
                
                if (saveRes.ok) {
                    alert("설정이 성공적으로 저장되었습니다!");
                } else {
                    alert("설정 저장에 실패했습니다.");
                }
            } catch (e) {
                console.error("Save error", e);
                alert("서버 오류가 발생했습니다.");
            }
        }

        document.addEventListener("DOMContentLoaded", loadSettings);

        window.toggleSidebar = function () {
            const sidebar = document.querySelector(".sidebar");
            const overlay = document.querySelector(".sidebar-overlay");
            if (sidebar) sidebar.classList.toggle("active");
            if (overlay) overlay.classList.toggle("active");
        };
        
        document.querySelectorAll(".nav-item").forEach(item => {
            if (item.getAttribute("href") === "course_time_admin.html") {
                item.classList.add("highlight");
                let parentMenu = item.closest(".nav-sub-menu");
                if (parentMenu) {
                    parentMenu.classList.add("show");
                    if (parentMenu.previousElementSibling) {
                        parentMenu.previousElementSibling.classList.add("active");
                    }
                }
            }
        });
    
