import os

base_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
js_files = ["exam.js", "practical_exam.js"]

status_js_code = """
// --- Status Autocomplete Dropdown Functions ---
const STATUS_OPTIONS = ['합격', '불합격', '결시', '실격', '취소'];

function showStatusDropdown(input, index) {
    const dropdown = document.getElementById(`status-dropdown-${index}`);
    if (!dropdown) return;
    dropdown.style.display = 'block';
    populateStatusDropdown(input.value.trim(), index);
}

function filterStatusDropdown(input, index) {
    populateStatusDropdown(input.value.trim(), index);
}

function hideStatusDropdown(index) {
    setTimeout(() => {
        const dropdown = document.getElementById(`status-dropdown-${index}`);
        if (dropdown) dropdown.style.display = 'none';
    }, 200);
}

function populateStatusDropdown(filterStr, index) {
    const dropdown = document.getElementById(`status-dropdown-${index}`);
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    let count = 0;
    
    STATUS_OPTIONS.forEach(opt => {
        if (filterStr && !opt.includes(filterStr)) return;
        
        count++;
        const div = document.createElement('div');
        div.className = 'dropdown-item';
        
        let color = '#1e293b';
        if (opt === '합격') color = '#059669';
        if (opt === '불합격' || opt === '실격') color = '#dc2626';
        if (opt === '결시' || opt === '취소') color = '#64748b';
        
        div.innerHTML = `<div style="font-weight: 600; font-size: 0.85rem; color: ${color}; text-align: center;">${opt}</div>`;
        div.onmousedown = (e) => {
            e.preventDefault();
            selectStatusFromDropdown(index, opt);
        };
        dropdown.appendChild(div);
    });
    
    if (count === 0) {
        dropdown.innerHTML = '<div style="padding: 8px; color: #94a3b8; font-size: 0.75rem; text-align: center;">수기 입력<br>(텍스트)</div>';
    }
}

function selectStatusFromDropdown(index, value) {
    while (exams.length <= index) {
        exams.push({ examDate: '', resultDate: '', subject: '', name: '', time: '', examNum: '', genId: '', genPw: '', score: '', note: '', status: '' });
    }
    
    exams[index].status = value;
    saveExams();
    renderExamTable();
}
"""

for js_file in js_files:
    file_path = os.path.join(base_dir, js_file)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "const STATUS_OPTIONS" not in content:
        content += "\n" + status_js_code
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed {js_file}")

print("Done.")
