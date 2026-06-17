import re
import os

base_path = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public'
index_path = os.path.join(base_path, 'index.html')
out_path = os.path.join(base_path, 'attendance_manager.html')

with open(index_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract header and sidebar part, and footer part
# Content is usually inside <main> or <div class="main-content">
main_start = content.find('<main')
main_end = content.find('</main>') + 7

if main_start == -1:
    main_start = content.find('<div class="main-content">')
    # Finding matching closing div is tricky with regex, let's just find the end of the script tags or body
    # We can just replace everything between <div class="main-content"> and </body>

head_part = content[:main_start]

new_main = """
<main class="main-content">
    <div class="header" style="margin-bottom: 20px;">
        <h1>학생별 출석 관리</h1>
    </div>

    <div class="filter-section" style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; gap: 15px; margin-bottom: 20px;">
        <div class="form-group" style="flex: 1;">
            <label>과정명</label>
            <select id="courseFilter" class="form-control" onchange="loadStudents()">
                <option value="">전체 과정</option>
            </select>
        </div>
        <div class="form-group" style="flex: 1;">
            <label>시간별</label>
            <select id="timeFilter" class="form-control" onchange="loadStudents()">
                <option value="">전체 시간</option>
            </select>
        </div>
    </div>

    <div style="display: flex; gap: 20px;">
        <div class="student-list-container" style="flex: 1; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); height: 600px; overflow-y: auto;">
            <h3>학생 목록</h3>
            <div id="studentList" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
                <!-- Students injected here -->
            </div>
        </div>

        <div class="student-detail-container" style="flex: 2; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); height: 600px; overflow-y: auto;">
            <h3 id="detailTitle">출석 상세 관리 (학생을 선택하세요)</h3>
            <div id="attendanceDetail" style="margin-top: 20px;">
                <p style="color: #666;">좌측에서 학생을 선택하면 상세 출석 내역이 표시됩니다.</p>
            </div>
        </div>
    </div>

</main>
"""

# Include existing scripts but add our custom logic
scripts_part = """
    <style>
        .student-card { padding: 12px; border: 1px solid #ddd; border-radius: 6px; cursor: pointer; transition: background 0.2s; }
        .student-card:hover { background: #f5f5f5; }
        .student-card.active { background: #e3f2fd; border-color: #2196f3; }
        .month-block { margin-bottom: 25px; border: 1px solid #eee; border-radius: 8px; overflow: hidden; }
        .month-header { background: #f8f9fa; padding: 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; font-weight: bold; }
        .day-list { list-style: none; padding: 0; margin: 0; }
        .day-item { padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f1f1; }
        .day-item:last-child { border-bottom: none; }
        .btn-reset { background: #ff4d4f; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 0.9rem; }
        .btn-reset:hover { background: #ff7875; }
        .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: bold; }
        .status-present { background: #e6f7ff; color: #1890ff; }
        .status-absent { background: #fff1f0; color: #f5222d; }
        .status-tardy { background: #fffbe6; color: #faad14; }
        .status-early { background: #f6ffed; color: #52c41a; }
    </style>
    <script>
        let allMembers = [];
        let allAttendance = [];
        let currentStudent = null;

        async function init() {
            try {
                const memRes = await fetch('/api/sejong/members');
                allMembers = await memRes.json();
                
                const attRes = await fetch('/api/sejong/attendance');
                allAttendance = await attRes.json();
                
                populateFilters();
                loadStudents();
            } catch(e) {
                console.error("데이터 로딩 실패:", e);
                alert("데이터를 불러오는데 실패했습니다.");
            }
        }

        function populateFilters() {
            const courses = [...new Set(allMembers.map(m => m.course).filter(Boolean))].sort();
            const times = [...new Set(allMembers.map(m => m.time).filter(Boolean))].sort();
            
            const cFilter = document.getElementById('courseFilter');
            const tFilter = document.getElementById('timeFilter');
            
            courses.forEach(c => {
                const opt = document.createElement('option'); opt.value = c; opt.innerText = c; cFilter.appendChild(opt);
            });
            times.forEach(t => {
                const opt = document.createElement('option'); opt.value = t; opt.innerText = t; tFilter.appendChild(opt);
            });
        }

        function loadStudents() {
            const cVal = document.getElementById('courseFilter').value;
            const tVal = document.getElementById('timeFilter').value;
            
            let filtered = allMembers.filter(m => m.status !== 'inactive');
            if (cVal) filtered = filtered.filter(m => m.course === cVal);
            if (tVal) filtered = filtered.filter(m => m.time === tVal);
            
            // Sort by name
            filtered.sort((a,b) => (a.name || '').localeCompare(b.name || ''));
            
            const container = document.getElementById('studentList');
            container.innerHTML = '';
            
            if(filtered.length === 0) {
                container.innerHTML = '<div style="color:#999; text-align:center; padding: 20px;">결과가 없습니다.</div>';
                return;
            }
            
            filtered.forEach(m => {
                const div = document.createElement('div');
                div.className = 'student-card';
                if(currentStudent && currentStudent.id === m.id) div.classList.add('active');
                div.innerHTML = `
                    <div style="font-weight:bold; font-size:1.1rem; margin-bottom:4px;">${m.name}</div>
                    <div style="font-size:0.85rem; color:#666;">${m.course || '과정없음'} | ${m.time || '시간없음'}</div>
                `;
                div.onclick = () => selectStudent(m, div);
                container.appendChild(div);
            });
        }

        function selectStudent(member, cardEl) {
            currentStudent = member;
            document.querySelectorAll('.student-card').forEach(el => el.classList.remove('active'));
            cardEl.classList.add('active');
            
            renderAttendanceDetail();
        }

        function getStatusName(status) {
            if(status === 'present') return '<span class="status-badge status-present">O 출석</span>';
            if(status === 'absent') return '<span class="status-badge status-absent">X 결석</span>';
            if(status === 'tardy') return '<span class="status-badge status-tardy">지각</span>';
            if(status === 'early') return '<span class="status-badge status-early">조퇴</span>';
            return `<span class="status-badge">${status}</span>`;
        }

        function renderAttendanceDetail() {
            const container = document.getElementById('attendanceDetail');
            document.getElementById('detailTitle').innerText = `${currentStudent.name} 출석 상세 관리`;
            
            // Filter attendance for this member
            const mAtt = allAttendance.filter(a => String(a.memberId) === String(currentStudent.id));
            
            if(mAtt.length === 0) {
                container.innerHTML = '<div style="padding: 30px; text-align: center; color: #888; background: #fafafa; border-radius: 8px;">출석 기록이 없습니다.</div>';
                return;
            }
            
            // Group by month
            const byMonth = {};
            mAtt.forEach(a => {
                if(!a.date) return;
                const dateParts = a.date.split('-');
                if(dateParts.length >= 2) {
                    const monthKey = `${dateParts[0]}년 ${parseInt(dateParts[1])}월`;
                    if(!byMonth[monthKey]) byMonth[monthKey] = [];
                    byMonth[monthKey].push(a);
                }
            });
            
            // Sort months descending
            const sortedMonths = Object.keys(byMonth).sort((a,b) => b.localeCompare(a));
            
            let html = '';
            sortedMonths.forEach(mKey => {
                const logs = byMonth[mKey].sort((a,b) => b.date.localeCompare(a.date)); // Descending dates
                const dateList = logs.map(l => l.date);
                
                html += `
                <div class="month-block">
                    <div class="month-header">
                        <div style="font-size: 1.1rem;">📅 ${mKey}</div>
                        <button class="btn-reset" onclick='resetBatch(${JSON.stringify(dateList)})'>이 달 전체 초기화</button>
                    </div>
                    <ul class="day-list">
                `;
                
                logs.forEach(log => {
                    html += `
                        <li class="day-item">
                            <div>
                                <span style="font-weight: 500; margin-right: 15px;">${log.date}</span>
                                ${getStatusName(log.status)}
                            </div>
                            <button class="btn-reset" style="background: #ccc; color: #333;" onclick='resetBatch(["${log.date}"])'>삭제</button>
                        </li>
                    `;
                });
                
                html += `</ul></div>`;
            });
            
            container.innerHTML = html;
        }

        async function resetBatch(dateList) {
            if(!confirm(`선택한 ${dateList.length}건의 출석 데이터를 삭제하시겠습니까?\n이 작업은 서버 및 모든 출석부에서 영구 삭제됩니다.`)) return;
            
            const payload = {
                memberId: currentStudent.id,
                dates: dateList,
                status: 'unchecked',
                course: 'ALL' // Delete regardless of course distinction in the ghost records
            };
            
            try {
                const res = await fetch('/api/sejong/attendance/batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if(res.ok) {
                    alert('성공적으로 삭제되었습니다.');
                    // Reload attendance data
                    const attRes = await fetch('/api/sejong/attendance');
                    allAttendance = await attRes.json();
                    renderAttendanceDetail(); // re-render
                } else {
                    throw new Error('서버 오류');
                }
            } catch(e) {
                alert('초기화 중 오류가 발생했습니다.');
                console.error(e);
            }
        }

        window.onload = () => {
            init();
        };
    </script>
</body>
</html>
"""

tail_part = content[main_end:]
# Let's replace whatever is below </main> with our scripts_part and tail_part's scripts, actually we can just find </body>
body_end = content.find('</body>')
final_content = content[:main_start] + new_main + scripts_part

with open(out_path, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("Created attendance_manager.html")
