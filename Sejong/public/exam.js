let members = [];
let exams = [];

// Convert Hangul to initial English letters
function getHangulInitial(char) {
    if (!char || !char.match(/[가-힣]/)) return char ? char.toLowerCase() : '';
    const code = char.charCodeAt(0) - 44032;
    const choIdx = Math.floor(code / 588);
    const jungIdx = Math.floor((code - (choIdx * 588)) / 28);
    
    // For initials, mapping Cho-seong to English
    const choMap = ["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"];
    const jungMap = ["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"];
    
    let initial = choMap[choIdx];
    if (initial === "") {
        // If cho is 'ㅇ', we use the first letter of jung-seong
        initial = jungMap[jungIdx].charAt(0);
    }
    return initial;
}

// Generate ID from name and resident number
function generateId(name, resident_num) {
    if (!name) return "";
    let initials = "";
    // Max 3 letters
    const limit = Math.min(3, name.length);
    for(let i=0; i<limit; i++) {
        initials += getHangulInitial(name.charAt(i));
    }
    let res = "";
    if (resident_num) {
        res = resident_num.split('-')[0].substring(0, 6);
    }
    return initials + res;
}

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load members and exams data
    try {
        const mRes = await fetch(typeof getFetchUrl === 'function' ? getFetchUrl('members') : 'test_members.json');
        if (mRes.ok) {
            members = await mRes.json();
        }
    } catch (e) {
        console.error("Failed to load members", e);
    }

    try {
        const eRes = await fetch(typeof getFetchUrl === 'function' ? getFetchUrl('exams') : 'exam_data.json');
        if (eRes.ok) {
            exams = await eRes.json();
        }
    } catch (e) {
        console.error("Failed to load exams", e);
        // Fallback to empty
        exams = [];
    }

    renderExamTable();

    document.getElementById('btnAddNew').addEventListener('click', openStudentModal);
    document.getElementById('examSearchInput').addEventListener('input', renderExamTable);
    document.getElementById('examMonthFilter').addEventListener('change', renderExamTable);
});

function renderExamTable() {
    const tbody = document.getElementById('examTbody');
    if (!tbody) return;
    
    try {
        tbody.innerHTML = '';
        const searchStr = document.getElementById('examSearchInput') ? document.getElementById('examSearchInput').value.toLowerCase() : '';
        const monthStr = document.getElementById('examMonthFilter') ? document.getElementById('examMonthFilter').value : '';

        const validExams = Array.isArray(exams) ? exams : [];
        const sortedExams = [...validExams].sort((a, b) => (a.examDate || '').localeCompare(b.examDate || ''));

        sortedExams.forEach((exam, index) => {
            if (searchStr && (!exam.name || !exam.name.toLowerCase().includes(searchStr))) return;
            if (monthStr && (!exam.examDate || !exam.examDate.startsWith(monthStr))) return;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="col-date"><input type="text" value="${exam.examDate || ''}" onchange="updateExam(${index}, 'examDate', this.value)" placeholder="MM/DD"></td>
                <td class="col-res-date"><input type="text" value="${exam.resultDate || ''}" onchange="updateExam(${index}, 'resultDate', this.value)" placeholder="MM/DD"></td>
                <td class="col-subject"><input type="text" value="${exam.subject || ''}" onchange="updateExam(${index}, 'subject', this.value)"></td>
                <td class="col-name" style="font-weight: 500;">${exam.name || ''}</td>
                <td class="col-time"><input type="time" value="${exam.time || ''}" onchange="updateExam(${index}, 'time', this.value)"></td>
                <td class="col-exam-num"><input type="text" value="${exam.examNum || ''}" onchange="updateExam(${index}, 'examNum', this.value)"></td>
                <td class="col-id-pass">
                    <div class="id-pass-col">
                        <span>${exam.genId || ''}</span>
                        <span style="color: #64748b;">${exam.genPw || ''}</span>
                    </div>
                </td>
                <td class="col-score"><input type="text" value="${exam.score || ''}" onchange="updateExam(${index}, 'score', this.value)" class="${getScoreClass(exam.score)}"></td>
                <td class="col-note"><input type="text" value="${exam.note || ''}" onchange="updateExam(${index}, 'note', this.value)"></td>
                <td class="col-action"><span class="material-icons action-icon" onclick="deleteExam(${index})" title="삭제">delete</span></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error("renderExamTable error:", e);
    } finally {
        // Add empty rows if too few, to maintain notebook look
        const minRows = 25;
        const currentRows = tbody.children.length;
        for (let i = currentRows; i < minRows; i++) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="col-date"><input type="text" disabled style="background: transparent; border: none;"></td>
                <td class="col-res-date"><input type="text" disabled style="background: transparent; border: none;"></td>
                <td class="col-subject"><input type="text" disabled style="background: transparent; border: none;"></td>
                <td class="col-name"><input type="text" disabled style="background: transparent; border: none;"></td>
                <td class="col-time"><input type="time" disabled style="background: transparent; border: none;"></td>
                <td class="col-exam-num"><input type="text" disabled style="background: transparent; border: none;"></td>
                <td class="col-id-pass"></td>
                <td class="col-score"><input type="text" disabled style="background: transparent; border: none;"></td>
                <td class="col-note"><input type="text" disabled style="background: transparent; border: none;"></td>
                <td class="col-action"></td>
            `;
            tbody.appendChild(tr);
        }
    }
}

function getScoreClass(score) {
    if (!score) return '';
    if (score === '합격' || parseInt(score) >= 60) return 'pass';
    if (score === '실격' || score === '불합격' || parseInt(score) < 60) return 'fail';
    if (score === '취소') return 'cancel';
    return '';
}

function updateExam(index, field, value) {
    exams[index][field] = value;
    saveExams();
    if (field === 'score') renderExamTable(); // Re-render for color change
}

async function saveExams() {
    try {
        const url = typeof getFetchUrl === 'function' ? getFetchUrl('exams', true) : '/api/exams';
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(exams)
        });
    } catch (e) {
        console.error("Save failed", e);
    }
}

function deleteExam(index) {
    if (confirm("이 시험 기록을 삭제하시겠습니까?")) {
        exams.splice(index, 1);
        saveExams();
        renderExamTable();
    }
}

// Modal functions for adding new exam
function openStudentModal() {
    document.getElementById('studentModal').classList.add('active');
    document.getElementById('modalSearchInput').value = '';
    renderModalStudents();
}

function closeStudentModal() {
    document.getElementById('studentModal').classList.remove('active');
}

function renderModalStudents(filterStr = '') {
    const list = document.getElementById('modalStudentList');
    list.innerHTML = '';
    
    // Sort by name
    const sorted = [...members].sort((a,b) => (a.name||'').localeCompare(b.name||''));
    
    sorted.forEach(m => {
        if (filterStr && !m.name.includes(filterStr) && !m.phone.includes(filterStr)) return;
        
        const div = document.createElement('div');
        div.className = 'student-item';
        div.innerHTML = `
            <div>
                <div class="student-name">${m.name}</div>
                <div class="student-course">${m.course || '과정 없음'}</div>
            </div>
            <span class="material-icons" style="color: #cbd5e1;">add_circle</span>
        `;
        div.onclick = () => addExamForStudent(m);
        list.appendChild(div);
    });
}

function filterModalStudents() {
    const str = document.getElementById('modalSearchInput').value;
    renderModalStudents(str);
}

function addExamForStudent(member) {
    const genId = generateId(member.name, member.resident_num);
    const genPw = genId ? genId + '@' : '';
    
    const newExam = {
        memberId: member.id,
        name: member.name,
        examDate: '',
        resultDate: '',
        subject: member.course ? member.course.split('(')[0] : '', // Extract subject roughly
        time: '',
        examNum: '',
        genId: genId,
        genPw: genPw,
        score: '',
        note: ''
    };
    
    exams.push(newExam);
    saveExams();
    renderExamTable();
    closeStudentModal();
}
