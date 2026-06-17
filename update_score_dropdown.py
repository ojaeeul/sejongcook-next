import os

base_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
js_files = ["exam.js", "practical_exam.js"]

score_js_code = """
// --- Score Autocomplete Dropdown Functions ---
const SCORE_OPTIONS = ['합격', '불합격', '결시', '실격', '취소'];

function showScoreDropdown(input, index) {
    const dropdown = document.getElementById(`score-dropdown-${index}`);
    if (!dropdown) return;
    dropdown.style.display = 'block';
    populateScoreDropdown(input.value.trim(), index);
}

function filterScoreDropdown(input, index) {
    populateScoreDropdown(input.value.trim(), index);
}

function hideScoreDropdown(index) {
    setTimeout(() => {
        const dropdown = document.getElementById(`score-dropdown-${index}`);
        if (dropdown) dropdown.style.display = 'none';
    }, 200);
}

function populateScoreDropdown(filterStr, index) {
    const dropdown = document.getElementById(`score-dropdown-${index}`);
    if (!dropdown) return;
    
    dropdown.innerHTML = '';
    let count = 0;
    
    SCORE_OPTIONS.forEach(opt => {
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
            selectScoreFromDropdown(index, opt);
        };
        dropdown.appendChild(div);
    });
    
    if (count === 0) {
        dropdown.innerHTML = '<div style="padding: 8px; color: #94a3b8; font-size: 0.75rem; text-align: center;">수기 입력<br>(예: 85)</div>';
    }
}

function selectScoreFromDropdown(index, value) {
    while (exams.length <= index) {
        exams.push({ examDate: '', resultDate: '', subject: '', name: '', time: '', examNum: '', genId: '', genPw: '', score: '', note: '' });
    }
    
    exams[index].score = value;
    saveExams();
    renderExamTable();
}
"""

old_score_td = """<td class="col-score"><input type="text" value="${exam.score || ''}" onchange="updateExam(${index}, 'score', this.value)" class="${getScoreClass(exam.score)}"></td>"""
new_score_td = """<td class="col-score" style="position: relative; overflow: visible;">
                    <input type="text" value="${exam.score || ''}" 
                        onchange="updateExam(${index}, 'score', this.value)" 
                        onfocus="showScoreDropdown(this, ${index})" 
                        oninput="filterScoreDropdown(this, ${index})" 
                        onblur="hideScoreDropdown(${index})"
                        class="${getScoreClass(exam.score)}" autocomplete="off" placeholder="점수/결과">
                    <div id="score-dropdown-${index}" class="autocomplete-dropdown" style="display: none; min-width: 80px; width: 100%; text-align: center; left: 50%; transform: translateX(-50%);"></div>
                </td>"""

for js_file in js_files:
    file_path = os.path.join(base_dir, js_file)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    if "showScoreDropdown" not in content:
        # replace td
        content = content.replace(old_score_td, new_score_td)
        # append js
        content += score_js_code
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated score dropdown in {js_file}")

print("Done.")
