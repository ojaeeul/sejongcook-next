let examMembers = [];
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
        const url = typeof getFetchUrl === 'function' ? getFetchUrl('members') : '/api/sejong/members';
        const mRes = await fetch(url);
        if (mRes.ok) {
            examMembers = await mRes.json();
        }
    } catch (e) {
        console.error("Failed to load members", e);
    }

    try {
        const eRes = await fetch('exam_data.json');
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
        const displayExams = [...validExams];
        
        // Pad up to 25 rows to maintain the notebook look
        while (displayExams.length < 25) {
            displayExams.push({ examDate: '', resultDate: '', subject: '', name: '', time: '', examNum: '', genId: '', genPw: '', score: '', note: '' });
        }

        displayExams.forEach((exam, index) => {
            if (searchStr && (!exam.name || !exam.name.toLowerCase().includes(searchStr))) return;
            if (monthStr && (!exam.examDate || !exam.examDate.startsWith(monthStr))) return;

            const tr = document.createElement('tr');
            tr.setAttribute('title', '더블클릭하여 삭제');
            tr.setAttribute('ondblclick', `deleteExam(${index})`);
            tr.innerHTML = `
                <td class="col-date"><input type="text" value="${exam.examDate || ''}" onchange="updateExam(${index}, 'examDate', this.value)" placeholder="MM/DD"></td>
                <td class="col-res-date"><input type="text" value="${exam.resultDate || ''}" onchange="updateExam(${index}, 'resultDate', this.value)" placeholder="MM/DD"></td>
                <td class="col-subject"><input type="text" value="${exam.subject || ''}" onchange="updateExam(${index}, 'subject', this.value)"></td>
                <td class="col-name"><input type="text" value="${exam.name || ''}" onchange="updateExam(${index}, 'name', this.value)" style="font-weight: 500;" placeholder="이름 입력"></td>
                <td class="col-time"><input type="text" value="${exam.time || ''}" onchange="updateExam(${index}, 'time', this.value)"></td>
                <td class="col-exam-num"><input type="text" value="${exam.examNum || ''}" onchange="updateExam(${index}, 'examNum', this.value)"></td>
                <td class="col-id-pass">
                    <div class="id-pass-col">
                        <input type="text" value="${exam.genId || ''}" onchange="updateExam(${index}, 'genId', this.value)">
                        <input type="text" value="${exam.genPw || ''}" onchange="updateExam(${index}, 'genPw', this.value)" style="color: #64748b;">
                    </div>
                </td>
                <td class="col-score"><input type="text" value="${exam.score || ''}" onchange="updateExam(${index}, 'score', this.value)" class="${getScoreClass(exam.score)}"></td>
                <td class="col-note"><input type="text" value="${exam.note || ''}" onchange="updateExam(${index}, 'note', this.value)"></td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error("renderExamTable error:", e);
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
    // Ensure array has enough elements if editing a padded row
    while (exams.length <= index) {
        exams.push({ examDate: '', resultDate: '', subject: '', name: '', time: '', examNum: '', genId: '', genPw: '', score: '', note: '' });
    }
    
    exams[index][field] = value;
    
    // Auto-format dates
    if (field === 'examDate' || field === 'resultDate') {
        if (value.includes('/')) {
            let parts = value.split('/').map(p => p.replace(/[^0-9]/g, '')).filter(p => p !== '');
            if (parts.length >= 2) {
                let m = parts[0].padStart(2, '0');
                let d = parts[1].padStart(2, '0');
                if (m !== '00' && d !== '00') {
                    exams[index][field] = `${m}/${d}`;
                    renderExamTable();
                }
            } else if (parts.length === 1) {
                // If they just typed "10/" and hit enter, don't break it
            }
        } else {
            let cleaned = value.replace(/[^0-9]/g, '');
            if (cleaned.length === 4) {
                exams[index][field] = `${cleaned.substring(0, 2)}/${cleaned.substring(2, 4)}`;
                renderExamTable();
            } else if (cleaned.length === 3) {
                // If 3 digits, e.g. 501 -> 05/01. But what if 101 -> 10/01?
                // Usually month is 1-12. If the first two digits are > 12, then it's M/DD.
                let firstTwo = parseInt(cleaned.substring(0, 2));
                if (firstTwo >= 10 && firstTwo <= 12) {
                    exams[index][field] = `${cleaned.substring(0, 2)}/0${cleaned.substring(2, 3)}`;
                } else {
                    exams[index][field] = `0${cleaned.substring(0, 1)}/${cleaned.substring(1, 3)}`;
                }
                renderExamTable();
            } else if (cleaned.length === 1 || cleaned.length === 2) {
                // Just numbers, no formatting
            }
        }
    }
    
    // Auto-remove "기능사" if manually typed in subject
    if (field === 'subject' && value.includes('기능사')) {
        exams[index][field] = value.replace('기능사', '').trim();
        renderExamTable();
    }
    
    // Auto-format time
    if (field === 'time' && value) {
        let cleanValue = value.replace(/[^0-9:]/g, '');
        if (cleanValue && !cleanValue.includes(':')) {
            if (cleanValue.length <= 2) {
                cleanValue = cleanValue.padStart(2, '0') + ':00';
            } else if (cleanValue.length === 3) {
                const firstTwo = parseInt(cleanValue.substring(0, 2));
                if (firstTwo <= 23) {
                    cleanValue = cleanValue.substring(0, 2) + ':0' + cleanValue.substring(2, 3);
                } else {
                    cleanValue = '0' + cleanValue.substring(0, 1) + ':' + cleanValue.substring(1, 3);
                }
            } else if (cleanValue.length >= 4) {
                cleanValue = cleanValue.substring(0, 2) + ':' + cleanValue.substring(2, 4);
            }
            exams[index][field] = cleanValue;
            renderExamTable();
        }
    }
    
    // Auto-generate ID, PW, and Subject if name is entered
    if (field === 'name') {
        const member = examMembers.find(m => m.name && m.name.trim() === value.trim());
        if (member) {
            const genId = generateId(member.name, member.resident_num);
            exams[index].genId = genId;
            exams[index].genPw = genId ? genId + '@' : '';
            
            // Auto-fill subject if it's currently empty or name changed
            const memberCourse = member.course || member.course_select;
            if (memberCourse) {
                const courses = parseCourses(memberCourse);
                if (courses.length === 1) {
                    exams[index].subject = courses[0].split('(')[0].replace('기능사', '').trim();
                    saveExams();
                    renderExamTable();
                } else if (courses.length > 1) {
                    // Open course selection modal
                    openCourseSelectModal(index, courses);
                }
            }
        } else {
            // Generate basic ID if member not found
            const genId = generateId(value, '');
            exams[index].genId = genId;
            exams[index].genPw = genId ? genId + '@' : '';
        }
    }
    
    if (field === 'score' || field === 'name') renderExamTable();
    
    // Save to server
    saveExams();
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
    
    // Populate course dropdown by splitting comma-separated courses
    const courseSelect = document.getElementById('modalCourseSelect');
    courseSelect.innerHTML = '<option value="">전체 과정</option>';
    
    const allCourses = [];
    examMembers.forEach(m => {
        if (m.course) {
            m.course.split(',').forEach(c => {
                const trimmed = c.trim();
                if (trimmed) allCourses.push(trimmed);
            });
        }
    });
    const uniqueCourses = [...new Set(allCourses)].sort();
    uniqueCourses.forEach(course => {
        const option = document.createElement('option');
        option.value = course;
        option.textContent = course;
        courseSelect.appendChild(option);
    });
    
    // Reset selection to 'all'
    courseSelect.value = '';
    
    renderModalStudents();
}

function closeStudentModal() {
    document.getElementById('studentModal').classList.remove('active');
}

function renderModalStudents(filterStr = '', filterCourse = '') {
    const list = document.getElementById('modalStudentList');
    list.innerHTML = '';
    
    // Sort by name
    const sorted = [...examMembers].sort((a,b) => (a.name||'').localeCompare(b.name||''));
    
    sorted.forEach(m => {
        if (filterStr && !m.name.includes(filterStr) && !(m.phone && m.phone.includes(filterStr))) return;
        
        const memberCourse = m.course || m.course_select;
        const courses = memberCourse ? parseCourses(memberCourse) : ['과정 없음'];
        
        courses.forEach(course => {
            if (filterCourse && course !== filterCourse) return;
            
            const div = document.createElement('div');
            div.className = 'student-item';
            div.innerHTML = `
                <div>
                    <div class="student-name">${m.name}</div>
                    <div class="student-course">${course}</div>
                </div>
                <span class="material-icons" style="color: #cbd5e1;">add_circle</span>
            `;
            div.onclick = () => addExamForStudent(m, course);
            list.appendChild(div);
        });
    });
}

function filterModalStudents() {
    const str = document.getElementById('modalSearchInput').value;
    const course = document.getElementById('modalCourseSelect').value;
    renderModalStudents(str, course);
}

function addExamForStudent(member, selectedCourse) {
    const genId = generateId(member.name, member.resident_num);
    const genPw = genId ? genId + '@' : '';
    
    // Extract subject from course string and remove '기능사' (e.g. "일식기능사(19:00)" -> "일식")
    let subject = '';
    if (selectedCourse && selectedCourse !== '과정 없음') {
        subject = selectedCourse.split('(')[0].replace('기능사', '').trim();
    }
    
    const newExam = {
        memberId: member.id,
        name: member.name,
        examDate: '',
        resultDate: '',
        subject: subject,
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

// Course selection for manual name entry
function openCourseSelectModal(index, courses) {
    document.getElementById('courseSelectModal').classList.add('active');
    const list = document.getElementById('courseSelectList');
    list.innerHTML = '';
    
    courses.forEach(course => {
        const div = document.createElement('div');
        div.className = 'student-item';
        div.innerHTML = `
            <div>
                <div class="student-course" style="font-size: 1rem; color: #1e293b;">${course}</div>
            </div>
            <span class="material-icons" style="color: #cbd5e1;">check_circle</span>
        `;
        div.onclick = () => selectCourseForExam(index, course);
        list.appendChild(div);
    });
}

function closeCourseSelectModal() {
    document.getElementById('courseSelectModal').classList.remove('active');
}

function selectCourseForExam(index, course) {
    exams[index].subject = course.split('(')[0].replace('기능사', '').trim();
    saveExams();
    renderExamTable();
    closeCourseSelectModal();
}

function parseCourses(courseStr) {
    if (!courseStr) return [];
    let courses = courseStr.split(',').map(c => c.trim()).filter(c => c);
    
    // Expand "제과제빵" into two separate courses
    return courses.reduce((acc, c) => {
        if (c.includes('제과제빵')) {
            acc.push(c.replace('제과제빵', '제과'));
            acc.push(c.replace('제과제빵', '제빵'));
        } else {
            acc.push(c);
        }
        return acc;
    }, []);
}
