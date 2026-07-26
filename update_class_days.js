const fs = require('fs');
let content = fs.readFileSync('Sejong/SejongAttendance/public/class_days_admin.html', 'utf8');

// Replace the courseSettingsList with two containers
content = content.replace(
    /<div id="courseSettingsList">[\s\S]*?<\/div>\s*<\/div>/,
    `
        <h3 style="font-size: 1rem; color: #10b981; margin-bottom: 10px;">✅ 적용된 메뉴</h3>
        <div id="courseSettingsList" style="margin-bottom: 20px;">
            <div style="text-align:center; padding:40px; color:#94a3b8;">데이터를 불러오는 중입니다...</div>
        </div>

        <h3 style="font-size: 1rem; color: #64748b; margin-bottom: 10px;">❌ 적용 안된 메뉴 (요일 설정 제외)</h3>
        <div id="inactiveCourseSettingsList" style="opacity: 0.7;">
            <!-- Inactive courses will go here -->
        </div>
        `
);

// Update fetchTimetable to also fetch settings
content = content.replace(
    /let timetableData = \{\};\s*async function fetchTimetable\(\) \{[\s\S]*?function renderCourseSettings\(\) \{/,
    `let timetableData = {};
    let activeCourses = [];
    let inactiveCourses = [];

    async function fetchTimetable() {
        try {
            const [ttRes, setRes] = await Promise.all([
                fetch(SHEET_API_BASE + '/timetable'),
                fetch(SHEET_API_BASE + '/settings?t=' + Date.now())
            ]);
            
            if (ttRes.ok && setRes.ok) {
                timetableData = await ttRes.json();
                const setData = await setRes.json();
                let settingsObj = Array.isArray(setData) && setData.length > 0 ? setData[0] : (setData.key === "settings" ? setData.value : setData);
                
                activeCourses = settingsObj.courses || [];
                inactiveCourses = settingsObj.inactiveCourses || [];
                
                // Ensure all courses in timetable are at least somewhere
                Object.keys(timetableData).forEach(c => {
                    if (!activeCourses.includes(c) && !inactiveCourses.includes(c)) {
                        activeCourses.push(c);
                    }
                });

                renderCourseSettings();
            }
        } catch (e) {
            console.error('Failed to fetch:', e);
            document.getElementById('courseSettingsList').innerHTML = '<div style="text-align:center; padding:40px; color:#ef4444;">데이터를 불러오는데 실패했습니다. 서버가 실행 중인지 확인해주세요.</div>';
        }
    }

    function renderCourseSettings() {`
);

// Rewrite renderCourseSettings
content = content.replace(
    /function renderCourseSettings\(\) \{[\s\S]*?function addNewCourse\(\) \{/,
    `function renderCourseSettings() {
        const container = document.getElementById('courseSettingsList');
        const inactiveContainer = document.getElementById('inactiveCourseSettingsList');
        if (!container || !inactiveContainer) return;
        
        container.innerHTML = '';
        inactiveContainer.innerHTML = '';

        if (activeCourses.length === 0 && inactiveCourses.length === 0) {
            container.innerHTML = '<div style="text-align:center; padding:40px; color:#94a3b8;">등록된 과정이 없습니다.</div>';
            return;
        }

        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

        const createRow = (course, isActive) => {
            const row = document.createElement('div');
            row.className = 'course-row';
            if (!isActive) row.style.background = '#f1f5f9';

            const nameWrap = document.createElement('div');
            nameWrap.style.display = 'flex';
            nameWrap.style.alignItems = 'center';
            nameWrap.style.gap = '8px';
            nameWrap.style.width = '250px';

            const name = document.createElement('div');
            name.className = 'course-name';
            name.textContent = course;
            name.style.width = 'auto';

            const delBtn = document.createElement('span');
            delBtn.className = 'material-icons';
            delBtn.textContent = 'remove_circle_outline';
            delBtn.style.color = '#ef4444';
            delBtn.style.cursor = 'pointer';
            delBtn.style.fontSize = '1.2rem';
            delBtn.title = '이 과정 삭제';
            delBtn.onclick = () => deleteCourse(course);

            nameWrap.appendChild(name);
            nameWrap.appendChild(delBtn);
            row.appendChild(nameWrap);

            const toggles = document.createElement('div');
            toggles.className = 'days-toggles';

            // 월(1) ~ 토(6), 일(0)
            const displayOrder = [1, 2, 3, 4, 5, 6, 0];
            for (let i of displayOrder) {
                const btn = document.createElement('div');
                btn.className = 'day-toggle';
                
                if (isActive) {
                    if (timetableData[course] && timetableData[course].includes(i)) {
                        btn.classList.add('selected');
                    }
                    btn.onclick = () => {
                        btn.classList.toggle('selected');
                    };
                } else {
                    // inactive: days are automatically excluded (not selected) and disabled
                    btn.style.cursor = 'not-allowed';
                    btn.style.background = '#e2e8f0';
                    btn.style.color = '#94a3b8';
                    btn.style.borderColor = '#cbd5e1';
                }
                
                btn.textContent = dayNames[i];
                btn.dataset.day = i;
                toggles.appendChild(btn);
            }
            row.appendChild(toggles);
            return row;
        };

        activeCourses.forEach(course => {
            container.appendChild(createRow(course, true));
        });

        inactiveCourses.forEach(course => {
            inactiveContainer.appendChild(createRow(course, false));
        });
    }

    function addNewCourse() {`
);

// update saveSettings to not overwrite settings.courses with everything
content = content.replace(
    /if \(JSON\.stringify\(settingsObj\.courses\) !== JSON\.stringify\(newCourses\)\) \{[\s\S]*?await fetch/g,
    `// [Sync] Update settings courses only if there are new courses not in active or inactive
                        let changed = false;
                        newCourses.forEach(c => {
                            if (!settingsObj.courses.includes(c) && !(settingsObj.inactiveCourses && settingsObj.inactiveCourses.includes(c))) {
                                settingsObj.courses.push(c);
                                changed = true;
                            }
                        });
                        
                        if (changed) {
                            if(!settingsObj.courseFees) settingsObj.courseFees = {};
                            settingsObj.courses.forEach(c => {
                                if(settingsObj.courseFees[c] === undefined) settingsObj.courseFees[c] = 200000;
                            });
                            await fetch`
);

// update addNewCourse to sync properly
content = content.replace(
    /function addNewCourse\(\) \{[\s\S]*?function deleteCourse\(course\)/,
    `function addNewCourse() {
        const input = document.getElementById('newCourseName');
        const name = input.value.trim();
        if (!name) {
            alert('추가할 과정명을 입력해주세요.');
            return;
        }
        
        const rows = document.querySelectorAll('.course-row');
        rows.forEach(row => {
            const courseName = row.querySelector('.course-name').textContent;
            const activeDays = [];
            row.querySelectorAll('.day-toggle.selected').forEach(btn => {
                activeDays.push(parseInt(btn.dataset.day));
            });
            timetableData[courseName] = activeDays;
        });

        if (activeCourses.includes(name) || inactiveCourses.includes(name)) {
            alert('이미 존재하는 과정입니다.');
            return;
        }
        
        timetableData[name] = [];
        activeCourses.push(name);
        input.value = '';
        renderCourseSettings();
    }

    function deleteCourse(course)`
);

// also update deleteCourse to remove from active and inactive arrays
content = content.replace(
    /delete timetableData\[course\];/,
    `delete timetableData[course];
            activeCourses = activeCourses.filter(c => c !== course);
            inactiveCourses = inactiveCourses.filter(c => c !== course);`
);

fs.writeFileSync('Sejong/SejongAttendance/public/class_days_admin.html', content);
