let examMembers = [];
let exams = [];
let currentPage = 1;

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
        const eUrl = typeof getFetchUrl === 'function' ? getFetchUrl('practical_exams') : '/api/sejong/practical_exams';
        const eRes = await fetch(eUrl);
        if (eRes.ok) {
            exams = await eRes.json();
        }
    } catch (e) {
        console.error("Failed to load exams", e);
        // Fallback to empty
        exams = [];
    }

    const savedPage = localStorage.getItem('practicalExamCurrentPage');
    if (savedPage && !isNaN(parseInt(savedPage, 10))) {
        currentPage = parseInt(savedPage, 10);
    }

    populateCourseFilter();
    renderExamTable();

    document.getElementById('btnAddNew').addEventListener('click', openStudentModal);
    document.getElementById('examSearchInput').addEventListener('input', renderExamTable);
    document.getElementById('examMonthFilter').addEventListener('change', renderExamTable);
    document.getElementById('resultMonthFilter').addEventListener('change', renderExamTable);
});

window.isViewAllPages = false;

function toggleViewAllPages() {
    window.isViewAllPages = !window.isViewAllPages;
    const btn = document.getElementById('viewAllPagesBtn');
    if (btn) {
        if (window.isViewAllPages) {
            btn.style.background = '#e2e8f0';
            btn.textContent = '페이징 보기';
        } else {
            btn.style.background = 'white';
            btn.textContent = '페이지 전체보기';
        }
    }
    renderExamTable();
}

function renderExamTable() {
    populateCourseFilter(); // Update dropdown options
    const tbody = document.getElementById('examTbody');
    if (!tbody) return;
    
    try {
        tbody.innerHTML = '';
        const searchStr = document.getElementById('examSearchInput') ? document.getElementById('examSearchInput').value.toLowerCase() : '';
        const examMonthRaw = document.getElementById('examMonthFilter') ? document.getElementById('examMonthFilter').value : '';
        const resultMonthRaw = document.getElementById('resultMonthFilter') ? document.getElementById('resultMonthFilter').value : '';
        const resultDayStr = document.getElementById('resultDaySelect') ? document.getElementById('resultDaySelect').value : '';

        const examYearStr = examMonthRaw ? examMonthRaw.split('-')[0] : '';
        const examMonthStr = examMonthRaw ? examMonthRaw.split('-')[1] : '';
        const examDayStr = examMonthRaw ? examMonthRaw.split('-')[2] : '';
        
        const resultYearStr = resultMonthRaw ? resultMonthRaw.split('-')[0] : '';
        const resultMonthStr = resultMonthRaw ? resultMonthRaw.split('-')[1] : '';

        
        const currentFilterState = searchStr + '|' + examMonthRaw + '|' + resultMonthRaw;
        if (window.lastFilterState !== undefined && window.lastFilterState !== currentFilterState) {
            currentPage = 1;
            localStorage.setItem('practicalExamCurrentPage', currentPage);
        }
        window.lastFilterState = currentFilterState;

        const validExams = Array.isArray(exams) ? exams : [];
        const displayExams = [...validExams];
        
        // Remove empty rows from the end of the data array to determine real length
        let lastRealIndex = displayExams.length - 1;
        while (lastRealIndex >= 0) {
            const e = displayExams[lastRealIndex];
            if (e.name || e.subject || e.examDate || e.resultDate || e.score) {
                break;
            }
            lastRealIndex--;
        }
        
        // Keep only real data and attach original index
        const realDataWithIndex = displayExams.slice(0, lastRealIndex + 1).map((e, i) => ({ ...e, originalIndex: i }));
        
        // APPLY FILTERS BEFORE PAGINATION
        const courseFilter = document.getElementById('courseFilter') ? document.getElementById('courseFilter').value : 'ALL';
        
        const filteredData = realDataWithIndex.filter(exam => {
            if (courseFilter !== 'ALL') {
                if (!exam.subject || exam.subject !== courseFilter) return false;
            }
            if (searchStr && (!exam.name || !exam.name.toLowerCase().includes(searchStr))) return false;
            
            // Exam Date Filtering
            if (examMonthStr) {
                if (!exam.examDate) return false;
                const filterStr = examMonthStr + "/" + (examDayStr || "");
                if (!exam.examDate.startsWith(filterStr)) return false;
            }
            
            // Result Date Filtering
            if (resultMonthStr) {
                if (!exam.resultDate) return false;
                const filterStr = resultMonthStr + "/" + (resultDayStr || "");
                if (!exam.resultDate.startsWith(filterStr)) return false;
            }
            return true;
        });
        
        window.isViewAllPages = true; // Always view all pages with this new layout
        const rowsPerPage = window.isViewAllPages ? Math.max(filteredData.length, 15) : 15;
        let totalPages = Math.ceil(filteredData.length / rowsPerPage);
        if (totalPages === 0) totalPages = 1;
        
        // Auto-add new page if the last filtered row is filled, but only if no search filter is active
        // If searching, we just show matches. If not searching, we give a blank row at the end
        if (searchStr === '' && !examMonthStr && !resultMonthStr && filteredData.length > 0 && filteredData.length % rowsPerPage === 0) {
            totalPages++;
        }
        
        // Ensure totalPages is at least currentPage so forced blank pages aren't destroyed
        if (currentPage > totalPages) {
            totalPages = currentPage;
        }
        
        if (currentPage < 1) currentPage = 1;
        
        // Save current page to localStorage so it persists across refreshes
        localStorage.setItem('practicalExamCurrentPage', currentPage);
        
        // Update pagination indicator
        const indicators = document.querySelectorAll('.pageIndicator');
        indicators.forEach(indicator => {
            indicator.textContent = `${currentPage} / ${totalPages} 페이지`;
        });
        const oldIndicator = document.getElementById('pageIndicator');
        if (oldIndicator) oldIndicator.textContent = `${currentPage} / ${totalPages} 페이지`;
        
        // Update table header years
        const thExamYear = document.getElementById('tableHeaderExamYear');
        const defaultYear = new Date().getFullYear() + '년';
        if (thExamYear) {
            thExamYear.textContent = examYearStr ? examYearStr + '년' : defaultYear;
        }
        const thResultYear = document.getElementById('tableHeaderResultYear');
        if (thResultYear) {
            thResultYear.textContent = resultYearStr ? resultYearStr + '년' : defaultYear;
        }
        
        const startIdx = (currentPage - 1) * rowsPerPage;
        const pageExams = filteredData.slice(startIdx, startIdx + rowsPerPage);
        
        // Pad the page with empty rows if needed
        const currentDataLength = validExams.length;
        let padCounter = 0;
        while (pageExams.length < rowsPerPage) {
            pageExams.push({
                originalIndex: currentDataLength + padCounter,
                examDate: '', resultDate: '', subject: '', name: '', time: '', examNum: '', genId: '', genPw: '', score: '', note: ''
            });
            padCounter++;
        }

        pageExams.forEach((exam) => {
            const index = exam.originalIndex;

            const tr = document.createElement('tr');
            tr.setAttribute('title', '더블클릭하여 삭제');
            tr.setAttribute('ondblclick', `deleteExam(${index})`);
            tr.innerHTML = `
                <td class="col-date"><input type="text" value="${exam.examDate || ''}" onchange="updateExam(${index}, 'examDate', this.value)" placeholder="MM/DD"></td>
                <td class="col-res-date"><input type="text" value="${exam.resultDate || ''}" onchange="updateExam(${index}, 'resultDate', this.value)" placeholder="MM/DD"></td>
                <td class="col-subject"><input type="text" value="${exam.subject || ''}" onchange="updateExam(${index}, 'subject', this.value)"></td>
                <td class="col-name" style="position: relative; overflow: visible;">
                    <input type="text" value="${exam.name || ''}" 
                        onchange="updateExam(${index}, 'name', this.value)" 
                        onfocus="showStudentDropdown(this, ${index})" 
                        oninput="filterStudentDropdown(this, ${index})" 
                        onblur="hideStudentDropdown(${index})"
                        style="font-weight: 500;" placeholder="이름 입력" autocomplete="off">
                    <div id="dropdown-${index}" class="autocomplete-dropdown" style="display: none;"></div>
                </td>
                <td class="col-time"><input type="text" value="${exam.time || ''}" onchange="updateExam(${index}, 'time', this.value)"></td>
                <td class="col-exam-num"><input type="text" value="${exam.examNum || ''}" onchange="updateExam(${index}, 'examNum', this.value)"></td>
                <td class="col-id-pass">
                    <div class="id-pass-col">
                        <input type="text" value="${exam.genId || ''}" onchange="updateExam(${index}, 'genId', this.value)">
                        <input type="text" value="${exam.genPw || ''}" onchange="updateExam(${index}, 'genPw', this.value)" style="color: #64748b;">
                    </div>
                </td>
                <td class="col-score"><input type="text" value="${exam.score || ''}" onchange="updateExam(${index}, 'score', this.value)" class="${getScoreClass(exam.score)}"></td>
                <td class="col-note" style="position: relative; overflow: visible;">
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
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) {
        console.error("renderExamTable error:", e);
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        animatePageTurn('prev');
    }
}

function nextPage() {
    currentPage++;
    animatePageTurn('next');
}

function animatePageTurn(dir) {
    const container = document.getElementById('notebookContainer');
    if (!container) return renderExamTable();
    
    // Smooth horizontal slide out
    container.style.transition = 'transform 0.25s ease-in, opacity 0.25s ease-in';
    
    if (dir === 'next') {
        container.style.transform = 'translateX(-40px)';
    } else {
        container.style.transform = 'translateX(40px)';
    }
    container.style.opacity = '0';
    
    setTimeout(() => {
        renderExamTable();
        
        container.style.transition = 'none';
        if (dir === 'next') {
            container.style.transform = 'translateX(40px)';
        } else {
            container.style.transform = 'translateX(-40px)';
        }
        
        // Force reflow
        void container.offsetWidth;
        
        // Smooth horizontal slide in with a nice cubic-bezier curve
        container.style.transition = 'transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.35s ease-out';
        container.style.transform = 'translateX(0)';
        container.style.opacity = '1';
    }, 250);
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
        const url = typeof getFetchUrl === 'function' ? getFetchUrl('practical_exams', true) : '/api/sejong/practical_exams';
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

// Inline Month Picker Logic
const pickerDates = {
    exam: null, // null means "전체" (All)
    result: null
};

function initInlineMonthPickers() {
    const today = new Date();
    ['exam', 'result'].forEach(type => {
        populateInlineSelects(type, today.getFullYear(), today.getMonth());
    });
}

function populateInlineSelects(type, y, m, d = null) {
    const yearSelect = document.getElementById(type + 'YearSelect');
    const monthSelect = document.getElementById(type + 'MonthSelect');
    const daySelect = document.getElementById(type + 'DaySelect');
    
    let yearOptions = '<option value="">년</option>';
    for(let i=y-5; i<=y+5; i++) {
        yearOptions += `<option value="${i}">${i}년</option>`;
    }
    yearSelect.innerHTML = yearOptions;
    
    let monthOptions = '<option value="">월</option>';
    for(let i=0; i<12; i++) {
        monthOptions += `<option value="${i}">${i+1}월</option>`;
    }
    monthSelect.innerHTML = monthOptions;

    let dayOptions = '<option value="">일</option>';
    for(let i=1; i<=31; i++) {
        dayOptions += `<option value="${i}">${i}일</option>`;
    }
    daySelect.innerHTML = dayOptions;
}

function updateInlineSelects(type) {
    const yearSelect = document.getElementById(type + 'YearSelect');
    const monthSelect = document.getElementById(type + 'MonthSelect');
    const daySelect = document.getElementById(type + 'DaySelect');
    
    if (pickerDates[type] === null) {
        yearSelect.value = "";
        monthSelect.value = "";
        daySelect.value = "";
    } else {
        yearSelect.value = pickerDates[type].getFullYear();
        monthSelect.value = pickerDates[type].getMonth();
        daySelect.value = pickerDates[type].getDate() || "";
    }
}

function changeInlineMonth(type, delta) {
    if (pickerDates[type] === null) {
        pickerDates[type] = new Date();
        pickerDates[type].setDate(1); // Default to 1st
    } else {
        // preserve day if possible, or set to 1 if it was null
        const currentDay = pickerDates[type].getDate() || 1;
        pickerDates[type].setMonth(pickerDates[type].getMonth() + delta);
        pickerDates[type].setDate(currentDay);
    }
    updateInlineSelects(type);
    applyInlineMonth(type, true);
}

function resetInlineMonth(type) {
    pickerDates[type] = null;
    updateInlineSelects(type);
    applyInlineMonth(type, true);
}

function applyInlineMonth(type, skipRead = false) {
    const yearSelect = document.getElementById(type + 'YearSelect');
    const monthSelect = document.getElementById(type + 'MonthSelect');
    const daySelect = document.getElementById(type + 'DaySelect');
    
    if (!skipRead) {
        const y = yearSelect.value;
        const m = monthSelect.value;
        const d = daySelect.value;
        if (y === "" && m === "" && d === "") {
            pickerDates[type] = null;
        } else {
            // If year/month not selected, use current year/month as fallback
            const fallbackDate = new Date();
            const year = y === "" ? fallbackDate.getFullYear() : parseInt(y);
            const month = m === "" ? fallbackDate.getMonth() : parseInt(m);
            const day = d === "" ? null : parseInt(d);
            pickerDates[type] = new Date(year, month, day || 1); // Set to 1st if day is empty for date object
            if (d === "") {
                pickerDates[type].isDayEmpty = true;
            } else {
                pickerDates[type].isDayEmpty = false;
                pickerDates[type].setDate(day);
            }
        }
        updateInlineSelects(type);
    }
    
    const hiddenInput = document.getElementById(type + 'MonthFilter');
    if (pickerDates[type] === null) {
        hiddenInput.value = '';
    } else {
        const y = pickerDates[type].getFullYear();
        const m = pickerDates[type].getMonth() + 1;
        const d = pickerDates[type].isDayEmpty ? '' : pickerDates[type].getDate();
        hiddenInput.value = y + '-' + (m < 10 ? '0'+m : m) + '-' + (d ? (d < 10 ? '0'+d : d) : '');
    }
    
    renderExamTable();
}

// Call init when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initInlineMonthPickers();
});



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



// --- Status Autocomplete Dropdown Functions ---
const STATUS_OPTIONS = ['합격', '불합격', '결시', '실격', '취소'];

function showStatusDropdown(input, index) {
    const dropdown = document.getElementById(`status-dropdown-${index}`);
    if (!dropdown) return;
    dropdown.style.display = 'block';
    if (dropdown.parentElement) dropdown.parentElement.style.zIndex = '1000';
    populateStatusDropdown(input.value.trim(), index);
}

function filterStatusDropdown(input, index) {
    populateStatusDropdown(input.value.trim(), index);
}

function hideStatusDropdown(index) {
    setTimeout(() => {
        const dropdown = document.getElementById(`status-dropdown-${index}`);
        if (dropdown) {
            dropdown.style.display = 'none';
            if (dropdown.parentElement) dropdown.parentElement.style.zIndex = '10';
        }
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


function filterListByCourse() {
    window.isViewAllPages = true; // Automatically view all when filtering
    renderExamTable();
}

function populateCourseFilter() {
    const courseSelect = document.getElementById('courseFilter');
    if (!courseSelect) return;
    
    const currentVal = courseSelect.value;
    const sortedCourses = ['한식기능사', '양식기능사', '일식기능사', '중식기능사', '복어기능사', '산업기사', '기능장', '기타'];
    courseSelect.innerHTML = '<option value="ALL">전체보기</option>';
    
    sortedCourses.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.textContent = c;
        courseSelect.appendChild(option);
    });
    
    if (sortedCourses.includes(currentVal)) {
        courseSelect.value = currentVal;
    }
}

function clearCurrentPageData() {
    if (confirm("⚠️ 현재 화면에 보이는 실기시험 기록을 모두 삭제하시겠습니까?\n(이 작업은 서버에서도 완전히 삭제되며 되돌릴 수 없습니다!)")) {
        const trs = document.querySelectorAll('#examTbody tr');
        let indicesToDelete = [];
        trs.forEach(tr => {
            const dblclickAttr = tr.getAttribute('ondblclick');
            if (dblclickAttr && dblclickAttr.startsWith('deleteExam(')) {
                const idxStr = dblclickAttr.replace('deleteExam(', '').replace(')', '');
                const idx = parseInt(idxStr, 10);
                if (!isNaN(idx)) {
                    indicesToDelete.push(idx);
                }
            }
        });
        
        indicesToDelete.sort((a, b) => b - a);
        
        let deletedCount = 0;
        indicesToDelete.forEach(idx => {
            if (idx < exams.length && (exams[idx].name || exams[idx].subject || exams[idx].examDate || exams[idx].score)) {
                exams.splice(idx, 1);
                deletedCount++;
            }
        });
        
        if (deletedCount > 0) {
            saveExams();
            renderExamTable();
            alert(deletedCount + "개의 기록이 성공적으로 삭제되었습니다.");
        } else {
            alert("삭제할 기록이 없습니다.");
        }
    }
}
