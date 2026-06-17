import os
import re

base_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
html_files = ["exam.html", "practical_exam.html"]
js_files = ["exam.js", "practical_exam.js"]

# 1. Update HTML files for padding
for html_file in html_files:
    file_path = os.path.join(base_dir, html_file)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Change notebook-page padding from 40px 30px 40px 50px to 40px 90px 40px 50px
    content = content.replace("padding: 40px 30px 40px 50px;", "padding: 40px 95px 40px 50px;")
    
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated padding in {html_file}")

# 2. Update JS files to remove score dropdown and add status dropdown
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
    
    # Remove the old Score Autocomplete block
    if "// --- Score Autocomplete Dropdown Functions ---" in content:
        # Split and remove the score block
        parts = content.split("// --- Score Autocomplete Dropdown Functions ---")
        content = parts[0]
        # remove up to the end or to another block if any, but it was the last block we added.
        # actually, let's just use regex or split to cleanly remove it.
        # Since I added it at the end of the file in the previous step, parts[0] is exactly what was there before it.
    
    # We must also replace the old_score_td (with dropdown) back to normal score td
    # The current one has "showScoreDropdown" in it. Let's find it with regex.
    score_td_pattern = re.compile(r'<td class="col-score"[^>]*>.*?</td>', re.DOTALL)
    normal_score_td = """<td class="col-score"><input type="text" value="${exam.score || ''}" onchange="updateExam(${index}, 'score', this.value)" class="${getScoreClass(exam.score)}"></td>"""
    content = score_td_pattern.sub(normal_score_td, content)

    # Now replace the col-note td to include the outside box status input
    note_td_pattern = re.compile(r'<td class="col-note"><input type="text" value="\${exam\.note \|\| \'\'}" onchange="updateExam\(\${index}, \'note\', this\.value\)"></td>')
    
    new_note_td = """<td class="col-note" style="position: relative; overflow: visible;">
                    <input type="text" value="${exam.note || ''}" onchange="updateExam(${index}, 'note', this.value)">
                    <!-- 박스 밖 결과 입력 -->
                    <div style="position: absolute; right: -85px; top: 4px; width: 75px; z-index: 10;">
                        ${(() => {
                            let statusColor = '#1e293b';
                            if (exam.status === '합격') statusColor = '#059669';
                            if (exam.status === '불합격' || exam.status === '실격') statusColor = '#dc2626';
                            if (exam.status === '결시' || exam.status === '취소') statusColor = '#64748b';
                            return `
                            <input type="text" value="${exam.status || ''}" 
                                onchange="updateExam(${index}, 'status', this.value)" 
                                onfocus="showStatusDropdown(this, ${index})" 
                                oninput="filterStatusDropdown(this, ${index})" 
                                onblur="hideStatusDropdown(${index})"
                                style="width: 100%; height: 32px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.75rem; background: #ffffff; color: ${statusColor}; font-weight: ${exam.status ? '700' : '500'}; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.08); outline: none; transition: border 0.2s;" 
                                placeholder="결과" autocomplete="off">
                            `;
                        })()}
                        <div id="status-dropdown-${index}" class="autocomplete-dropdown" style="display: none; min-width: 80px; width: 100%; text-align: center; left: 50%; transform: translateX(-50%); top: calc(100% + 2px);"></div>
                    </div>
                </td>"""
    
    content = note_td_pattern.sub(new_note_td, content)

    # append status_js_code
    if "showStatusDropdown" not in content:
        content += status_js_code

    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Updated JS in {js_file}")

print("Done.")
