import os

base_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
js_files = ["exam.js", "practical_exam.js"]

new_js_code = """
// --- Autocomplete Dropdown Functions ---
let activeDropdownCourse = null;

function showStudentDropdown(input, index) {
    const dropdown = document.getElementById(`dropdown-${index}`);
    if (!dropdown) return;
    dropdown.style.display = 'block';
    activeDropdownCourse = null; // reset to course list when focusing
    populateStudentDropdown(input.value.trim(), index);
}

function filterStudentDropdown(input, index) {
    // If user types something, break out of course mode to show global search results
    if (input.value.trim().length > 0) {
        activeDropdownCourse = null;
    }
    populateStudentDropdown(input.value.trim(), index);
}

function hideStudentDropdown(index) {
    setTimeout(() => {
        const dropdown = document.getElementById(`dropdown-${index}`);
        if (dropdown) dropdown.style.display = 'none';
    }, 200);
}

function populateStudentDropdown(filterStr, index) {
    const dropdown = document.getElementById(`dropdown-${index}`);
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    
    // 1. Global Search Mode (when typing)
    if (filterStr.length > 0) {
        const sorted = [...examMembers].sort((a,b) => (a.name||'').localeCompare(b.name||''));
        let count = 0;
        
        sorted.forEach(m => {
            if (!m.name.includes(filterStr) && !(m.phone && m.phone.includes(filterStr))) return;
            
            const memberCourse = m.course || m.course_select;
            const courses = memberCourse ? parseCourses(memberCourse) : ['과정 없음'];
            
            courses.forEach(course => {
                count++;
                const div = document.createElement('div');
                div.className = 'dropdown-item';
                div.innerHTML = `
                    <div style="font-weight: 500; font-size: 0.85rem; color: #1e293b;">${m.name}</div>
                    <div style="font-size: 0.75rem; color: #64748b;">${course}</div>
                `;
                div.onmousedown = (e) => {
                    e.preventDefault(); // prevent blur
                    selectStudentFromDropdown(index, m, course);
                };
                dropdown.appendChild(div);
            });
        });
        
        if (count === 0) {
            dropdown.innerHTML = '<div style="padding: 10px; color: #94a3b8; font-size: 0.8rem; text-align: center;">검색결과 없음 (수기 입력 가능)</div>';
        }
        return;
    }
    
    // 2. Course Selected Mode (Show students in a specific course)
    if (activeDropdownCourse) {
        const backBtn = document.createElement('div');
        backBtn.className = 'dropdown-item';
        backBtn.style.background = '#f1f5f9';
        backBtn.style.position = 'sticky';
        backBtn.style.top = '0';
        backBtn.style.borderBottom = '2px solid #cbd5e1';
        backBtn.innerHTML = `<div style="font-weight: bold; font-size: 0.85rem; color: #3b82f6;">← 뒤로가기</div><div style="font-size: 0.75rem; color: #64748b;">현재: ${activeDropdownCourse}</div>`;
        backBtn.onmousedown = (e) => {
            e.preventDefault();
            activeDropdownCourse = null;
            populateStudentDropdown('', index);
        };
        dropdown.appendChild(backBtn);
        
        const sorted = [...examMembers].sort((a,b) => (a.name||'').localeCompare(b.name||''));
        let count = 0;
        
        sorted.forEach(m => {
            const memberCourse = m.course || m.course_select;
            const courses = memberCourse ? parseCourses(memberCourse) : ['과정 없음'];
            
            if (courses.includes(activeDropdownCourse)) {
                count++;
                const div = document.createElement('div');
                div.className = 'dropdown-item';
                div.innerHTML = `
                    <div style="font-weight: 500; font-size: 0.85rem; color: #1e293b;">${m.name}</div>
                    <div style="font-size: 0.75rem; color: #64748b;">${activeDropdownCourse}</div>
                `;
                div.onmousedown = (e) => {
                    e.preventDefault(); // prevent blur
                    selectStudentFromDropdown(index, m, activeDropdownCourse);
                };
                dropdown.appendChild(div);
            }
        });
        
        if (count === 0) {
            const div = document.createElement('div');
            div.style.padding = '10px';
            div.style.color = '#94a3b8';
            div.style.fontSize = '0.8rem';
            div.style.textAlign = 'center';
            div.textContent = '수강생 없음';
            dropdown.appendChild(div);
        }
        return;
    }
    
    // 3. Course List Mode (Default when empty)
    const allCourses = new Set();
    examMembers.forEach(m => {
        const memberCourse = m.course || m.course_select;
        const courses = memberCourse ? parseCourses(memberCourse) : ['과정 없음'];
        courses.forEach(c => allCourses.add(c));
    });
    
    // Custom sort to put "과정 없음" at the end if it exists
    const sortedCourses = [...allCourses].sort((a, b) => {
        if (a === '과정 없음') return 1;
        if (b === '과정 없음') return -1;
        return a.localeCompare(b);
    });
    
    sortedCourses.forEach(course => {
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        div.innerHTML = `
            <div style="font-weight: 600; font-size: 0.85rem; color: #1e293b; display: flex; align-items: center; gap: 6px;">
                <span class="material-icons" style="font-size: 1rem; color: #3b82f6;">folder</span>
                ${course}
            </div>
        `;
        div.onmousedown = (e) => {
            e.preventDefault(); // prevent blur
            activeDropdownCourse = course;
            // Scroll to top when changing views
            dropdown.scrollTop = 0;
            populateStudentDropdown('', index);
        };
        dropdown.appendChild(div);
    });
    
    if (sortedCourses.length === 0) {
        dropdown.innerHTML = '<div style="padding: 10px; color: #94a3b8; font-size: 0.8rem; text-align: center;">과정 데이터 없음</div>';
    }
}

function selectStudentFromDropdown(index, member, course) {
    const genId = generateId(member.name, member.resident_num);
    const genPw = genId ? genId + '@' : '';
    let subject = '';
    if (course && course !== '과정 없음') {
        subject = course.split('(')[0].replace('기능사', '').trim();
    }
    
    while (exams.length <= index) {
        exams.push({ examDate: '', resultDate: '', subject: '', name: '', time: '', examNum: '', genId: '', genPw: '', score: '', note: '' });
    }
    
    exams[index].name = member.name;
    exams[index].subject = subject;
    exams[index].genId = genId;
    exams[index].genPw = genPw;
    
    saveExams();
    renderExamTable();
}
"""

for js_file in js_files:
    file_path = os.path.join(base_dir, js_file)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "// --- Autocomplete Dropdown Functions ---" in content:
        parts = content.split("// --- Autocomplete Dropdown Functions ---")
        new_content = parts[0] + new_js_code
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Updated autocomplete logic in {js_file}")

print("Done.")
