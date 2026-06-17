import os

base_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"

html_files = ["exam.html", "practical_exam.html"]
js_files = ["exam.js", "practical_exam.js"]

css_to_add = """
        .autocomplete-dropdown {
            position: absolute;
            top: calc(100% + 2px);
            left: 0;
            width: max-content;
            min-width: 150px;
            max-width: 250px;
            max-height: 200px;
            overflow-y: auto;
            background: white;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
            z-index: 1000;
            text-align: left;
        }
        .dropdown-item {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #f1f5f9;
            transition: background 0.2s;
        }
        .dropdown-item:hover {
            background: #f8fafc;
        }
        .dropdown-item:last-child {
            border-bottom: none;
        }
"""

for html_file in html_files:
    file_path = os.path.join(base_dir, html_file)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if ".autocomplete-dropdown {" not in content:
        content = content.replace("    </style>", css_to_add + "    </style>")
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated CSS in {html_file}")

js_code_to_add = """

// --- Autocomplete Dropdown Functions ---
function showStudentDropdown(input, index) {
    const dropdown = document.getElementById(`dropdown-${index}`);
    if (!dropdown) return;
    dropdown.style.display = 'block';
    populateStudentDropdown(input.value.trim(), index);
}

function filterStudentDropdown(input, index) {
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
    
    const sorted = [...examMembers].sort((a,b) => (a.name||'').localeCompare(b.name||''));
    let count = 0;
    
    sorted.forEach(m => {
        if (filterStr && !m.name.includes(filterStr) && !(m.phone && m.phone.includes(filterStr))) return;
        
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
        dropdown.innerHTML = '<div style="padding: 10px; color: #94a3b8; font-size: 0.8rem; text-align: center;">수기 입력 모드</div>';
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

old_td = """<td class="col-name"><input type="text" value="${exam.name || ''}" onchange="updateExam(${index}, 'name', this.value)" style="font-weight: 500;" placeholder="이름 입력"></td>"""
new_td = """<td class="col-name" style="position: relative; overflow: visible;">
                    <input type="text" value="${exam.name || ''}" 
                        onchange="updateExam(${index}, 'name', this.value)" 
                        onfocus="showStudentDropdown(this, ${index})" 
                        oninput="filterStudentDropdown(this, ${index})" 
                        onblur="hideStudentDropdown(${index})"
                        style="font-weight: 500;" placeholder="이름 입력" autocomplete="off">
                    <div id="dropdown-${index}" class="autocomplete-dropdown" style="display: none;"></div>
                </td>"""

for js_file in js_files:
    file_path = os.path.join(base_dir, js_file)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "showStudentDropdown" not in content:
        content = content.replace(old_td, new_td)
        content += js_code_to_add
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated JS in {js_file}")

print("Done.")
