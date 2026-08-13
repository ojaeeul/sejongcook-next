// exam_settings.js
window.allExamCourses = []; // Stores [{category: '...', courses: ['...']}, ...]

document.addEventListener('DOMContentLoaded', () => {
    loadExamCoursesForSettings();
});

window.loadExamCoursesForSettings = async function() {
    try {
        const res = await fetch('/api/sejong/exam-courses');
        if (!res.ok) throw new Error('Failed to fetch exam courses');
        const data = await res.json();
        
        if(Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
            window.allExamCourses = [{category: '기본과정', courses: data}];
        } else {
            window.allExamCourses = data;
        }

        renderCourseSettingsList();
    } catch (e) {
        console.error("loadExamCourses Error:", e);
    }
};

window.renderCourseSettingsList = function() {
    const container = document.getElementById('courseListContainer');
    if(!container) return;

    if(!window.allExamCourses || window.allExamCourses.length === 0) {
        container.innerHTML = '<div style="color:#94a3b8; text-align:center; padding: 20px;">등록된 상위 폴더가 없습니다.</div>';
        return;
    }

    let html = '';
    window.allExamCourses.forEach((catObj, catIndex) => {
        html += `
            <div style="margin-bottom: 15px; border: 1px solid #cbd5e1; border-radius: 8px; background: white; overflow: hidden;">
                <div style="display:flex; justify-content:space-between; align-items:center; padding: 10px 15px; background: #e2e8f0;">
                    <span style="font-weight:bold; color:#1e293b; font-size: 1.05rem;">📁 ${catObj.category}</span>
                    <button onclick="deleteExamCategory(${catIndex})" style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.8rem;"><i class="fas fa-minus"></i> 폴더 삭제</button>
                </div>
                <div style="padding: 10px 15px;">
        `;

        if (catObj.courses.length > 0) {
            catObj.courses.forEach((courseObj, courseIndex) => {
                let courseName = typeof courseObj === 'string' ? courseObj : courseObj.name;
                let exams = typeof courseObj === 'string' ? null : courseObj.exams;
                
                let examsHtml = '';
                if (exams && exams.length > 0) {
                    exams.forEach((exam, examIndex) => {
                        examsHtml += `
                            <div style="display:flex; justify-content:space-between; align-items:center; padding: 4px 10px; border-bottom: 1px solid #f1f5f9;">
                                <div style="display:flex; align-items:center; gap: 8px; flex: 1;">
                                    <span style="color:#64748b; font-size: 0.85rem;">📄</span>
                                    <input type="text" id="examName_${catIndex}_${courseIndex}_${examIndex}" value="${exam.name}" style="flex: 1; padding:4px; border:1px solid transparent; background:transparent; font-size: 0.85rem; color:#475569;" onblur="renameExamInCourse(${catIndex}, ${courseIndex}, ${examIndex}, this.value)">
                                </div>
                                <div style="margin-left: 10px; display: flex; gap: 4px;">
                                    <button onclick="document.getElementById('examName_${catIndex}_${courseIndex}_${examIndex}').focus()" style="background:transparent; color:#3b82f6; border:none; padding:4px; cursor:pointer; font-size:0.8rem;" title="이름 변경"><i class="fas fa-edit"></i></button>
                                    <button onclick="deleteExamFromCourse(${catIndex}, ${courseIndex}, ${examIndex})" style="background:transparent; color:#ef4444; border:none; padding:4px; cursor:pointer; font-size:0.8rem;" title="삭제"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        `;
                    });
                } else {
                    examsHtml = `<div style="padding: 4px 10px; color:#94a3b8; font-size: 0.85rem;">등록된 시험지가 없습니다.</div>`;
                }

                html += `
                    <div style="border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; padding: 6px 0;">
                            <div style="display:flex; align-items:center; gap: 8px; flex: 1;">
                                <span style="cursor:pointer;" onclick="const el = this.parentElement.parentElement.nextElementSibling; el.style.display = el.style.display === 'none' ? 'block' : 'none';">📂</span>
                                <input type="text" id="courseName_${catIndex}_${courseIndex}" value="${courseName}" style="flex: 1; padding:4px; border:1px solid transparent; background:transparent; font-size: 0.95rem; font-weight: 500; color:#334155;" onblur="renameExamCourse(${catIndex}, ${courseIndex}, this.value)">
                            </div>
                            <div style="margin-left: 10px; display: flex; gap: 4px;">
                                <button onclick="moveCourseUp(${catIndex}, ${courseIndex})" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:0.75rem;" title="위로 이동" ${courseIndex === 0 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}><i class="fas fa-arrow-up"></i></button>
                                <button onclick="moveCourseDown(${catIndex}, ${courseIndex})" style="background:#f1f5f9; color:#475569; border:1px solid #cbd5e1; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:0.75rem;" title="아래로 이동" ${courseIndex === catObj.courses.length - 1 ? 'disabled style="opacity:0.5;cursor:not-allowed;"' : ''}><i class="fas fa-arrow-down"></i></button>
                                <button onclick="document.getElementById('courseName_${catIndex}_${courseIndex}').focus()" style="background:#e0f2fe; color:#0284c7; border:none; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:0.75rem;" title="이름 변경"><i class="fas fa-edit"></i> 수정</button>
                                <button onclick="deleteExamCourseFromCategory(${catIndex}, ${courseIndex})" style="background:#f87171; color:white; border:none; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:0.75rem;"><i class="fas fa-times"></i> 삭제</button>
                            </div>
                        </div>
                        <div style="display:none; margin-left: 28px; background: #f1f5f9; padding: 8px; border-radius: 4px; border-left: 2px solid #cbd5e1; margin-top: 4px;">
                            ${examsHtml}
                            <div style="display:flex; gap:6px; margin-top: 8px; padding: 0 10px; align-items:center;">
                                <input type="text" id="newExamInput_${catIndex}_${courseIndex}" placeholder="새 시험지 추가 (예: 모의고사 1회)" style="flex:1; padding:4px 8px; border:1px solid #cbd5e1; border-radius:4px; font-size: 0.8rem;">
                                <button onclick="addExamToCourse(${catIndex}, ${courseIndex})" style="background:#3b82f6; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.8rem;"><i class="fas fa-plus"></i> 추가</button>
                                <label for="uploadExam_${catIndex}_${courseIndex}" style="background:#10b981; color:white; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:0.8rem; display:flex; align-items:center; gap:4px; margin:0;">
                                    <i class="fas fa-file-upload"></i> 파일 업로드로 추가
                                </label>
                                <input type="file" id="uploadExam_${catIndex}_${courseIndex}" accept=".hwp,.pdf,.jpg,.jpeg,.png" style="display:none;" onchange="uploadExamFile(event, ${catIndex}, ${courseIndex})">
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            html += `<div style="color:#94a3b8; font-size: 0.85rem; margin-left: 10px; margin-bottom: 10px;">소분류 폴더가 없습니다.</div>`;
        }

        html += `
                    <div style="display:flex; gap:8px; margin-top: 10px; margin-left: 10px;">
                        <input type="text" id="newSubCourseInput_${catIndex}" placeholder="새 소분류 폴더 이름 추가" style="flex:1; padding:6px; border:1px solid #cbd5e1; border-radius:4px; font-size: 0.85rem;">
                        <button onclick="addExamCourseToCategory(${catIndex})" style="background:#10b981; color:white; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:0.85rem;"><i class="fas fa-folder-plus"></i> 소분류 폴더 추가</button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
};

window.saveExamCoursesToAPI = async function() {
    try {
        const res = await fetch('/api/sejong/exam-courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window.allExamCourses)
        });
        if(!res.ok) throw new Error('Failed to save courses');
        
        await loadExamCoursesForSettings();
        if(window.syncSidebar) window.syncSidebar();
        
        alert("저장되었습니다.");
    } catch (e) {
        console.error("saveExamCoursesToAPI error:", e);
        alert("저장에 실패했습니다.");
    }
};

window.addExamCategory = function() {
    const input = document.getElementById('newCategoryInput');
    const newCat = input.value.trim();
    if(!newCat) {
        alert("상위 폴더 이름을 입력하세요.");
        return;
    }
    
    if(window.allExamCourses.find(c => c.category === newCat)) {
        alert("이미 존재하는 상위 폴더입니다.");
        return;
    }

    window.allExamCourses.push({ category: newCat, courses: [] });
    input.value = '';
    saveExamCoursesToAPI();
};

window.addExamCourseToCategory = function(catIndex) {
    const input = document.getElementById(`newSubCourseInput_${catIndex}`);
    const newCourse = input.value.trim();
    if(!newCourse) {
        alert("하위 폴더(과정) 이름을 입력하세요.");
        return;
    }

    let exists = false;
    window.allExamCourses.forEach(cat => {
        cat.courses.forEach(c => {
            let cName = typeof c === 'string' ? c : c.name;
            if(cName === newCourse) exists = true;
        });
    });

    if(exists) {
        alert("이미 다른 폴더에 존재하는 과정 이름입니다.");
        return;
    }

    window.allExamCourses[catIndex].courses.push({ name: newCourse, exams: [] });
    saveExamCoursesToAPI();
};

window.deleteExamCategory = function(catIndex) {
    const catName = window.allExamCourses[catIndex].category;
    if(!confirm(`'${catName}' 폴더와 그 안의 모든 과정을 삭제하시겠습니까?`)) return;

    window.allExamCourses.splice(catIndex, 1);
    saveExamCoursesToAPI();
};

window.deleteExamCourseFromCategory = function(catIndex, courseIndex) {
    const courseObj = window.allExamCourses[catIndex].courses[courseIndex];
    const courseName = typeof courseObj === 'string' ? courseObj : courseObj.name;
    if(!confirm(`'${courseName}' 과정을 삭제하시겠습니까?`)) return;

    window.allExamCourses[catIndex].courses.splice(courseIndex, 1);
    saveExamCoursesToAPI();
};

window.renameExamInCourse = function(catIndex, courseIndex, examIndex, newName) {
    newName = newName.trim();
    if(!newName) return;
    const courseObj = window.allExamCourses[catIndex].courses[courseIndex];
    if(typeof courseObj === 'string') return;
    
    if(courseObj.exams[examIndex].name !== newName) {
        courseObj.exams[examIndex].name = newName;
        saveExamCoursesToAPI();
    }
};

window.deleteExamFromCourse = function(catIndex, courseIndex, examIndex) {
    const courseObj = window.allExamCourses[catIndex].courses[courseIndex];
    if(typeof courseObj === 'string') return;
    
    const examName = courseObj.exams[examIndex].name;
    if(!confirm(`'${examName}' 시험지를 정말 삭제하시겠습니까?`)) return;
    
    courseObj.exams.splice(examIndex, 1);
    saveExamCoursesToAPI();
};

window.addExamToCourse = function(catIndex, courseIndex) {
    const input = document.getElementById(`newExamInput_${catIndex}_${courseIndex}`);
    const newExamName = input.value.trim();
    if(!newExamName) {
        alert("새 시험지 이름을 입력하세요.");
        return;
    }
    
    const courseObj = window.allExamCourses[catIndex].courses[courseIndex];
    if(typeof courseObj === 'string') return;
    
    // Generate a unique key for the new exam
    const newKey = `${courseObj.name}_${Date.now()}`;
    courseObj.exams.push({ name: newExamName, key: newKey });
    
    saveExamCoursesToAPI();
};

window.renameExamCourse = function(catIndex, courseIndex, newName) {
    newName = newName.trim();
    if(!newName) return;
    
    const cat = window.allExamCourses[catIndex];
    const courseObj = cat.courses[courseIndex];
    let oldName = typeof courseObj === 'string' ? courseObj : courseObj.name;
    
    if(oldName !== newName) {
        if(typeof courseObj === 'string') {
            cat.courses[courseIndex] = { name: newName, exams: [] };
        } else {
            courseObj.name = newName;
        }
        saveExamCoursesToAPI();
    }
};

window.moveCourseUp = function(catIndex, courseIndex) {
    if(courseIndex <= 0) return;
    const cat = window.allExamCourses[catIndex];
    const temp = cat.courses[courseIndex];
    cat.courses[courseIndex] = cat.courses[courseIndex - 1];
    cat.courses[courseIndex - 1] = temp;
    saveExamCoursesToAPI();
};

window.moveCourseDown = function(catIndex, courseIndex) {
    const cat = window.allExamCourses[catIndex];
    if(courseIndex >= cat.courses.length - 1) return;
    const temp = cat.courses[courseIndex];
    cat.courses[courseIndex] = cat.courses[courseIndex + 1];
    cat.courses[courseIndex + 1] = temp;
    saveExamCoursesToAPI();
};

window.uploadExamFile = async function(event, catIndex, courseIndex) {
    const file = event.target.files[0];
    if(!file) return;
    
    // UI Feedback
    const label = event.target.previousElementSibling;
    const originalText = label.innerHTML;
    label.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 분석 중...';
    label.style.pointerEvents = 'none';

    try {
        let extractedTextForGemini = '';
        let inlineData = null;

        if (file.name.toLowerCase().endsWith('.hwp')) {
            const formData = new FormData();
            formData.append('file', file);
            
            const res = await fetch('/api/sejong/hwp-extract', {
                method: 'POST',
                body: formData
            });
            
            if(!res.ok) throw new Error('HWP 추출 실패');
            const data = await res.json();
            extractedTextForGemini = data.html;
        } else if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
            // Read as base64
            const base64 = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = error => reject(error);
                reader.readAsDataURL(file);
            });
            inlineData = {
                mimeType: file.type,
                data: base64
            };
        } else {
            throw new Error('지원하지 않는 파일 형식입니다. (HWP, PDF, JPG, PNG만 가능)');
        }

        // 2. Send to Gemini API
        const prompt = "첨부된 문서(또는 이미지)에서 60개의 객관식 문제를 누락 없이 모두 추출하세요. 반드시 JSON 배열(Array) 형태로, 객체는 {\"q\": \"문제내용\", \"o\": [\"보기1\", \"보기2\", \"보기3\", \"보기4\"], \"a\": 정답번호(1~4)} 구조여야 합니다. 불필요한 설명 없이 JSON 배열만 출력하세요.";
        
        let parts = [{ text: prompt }];
        if (extractedTextForGemini) {
            parts.push({ text: extractedTextForGemini.substring(0, 80000) });
        } else if (inlineData) {
            parts.push({ inlineData });
        }

        const aiRes = await fetch('/api/sejong/ai_analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        if(!aiRes.ok) throw new Error('AI 분석 실패');
        const aiData = await aiRes.json();
        
        let questions = null;
        if(aiData.candidates && aiData.candidates[0].content.parts[0].text) {
            try {
                questions = JSON.parse(aiData.candidates[0].content.parts[0].text);
            } catch(e) {
                console.error("Parse Error:", aiData.candidates[0].content.parts[0].text);
            }
        }

        if(!questions || !Array.isArray(questions) || questions.length === 0) {
            throw new Error('문제 추출에 실패했습니다. (AI가 유효한 문항을 반환하지 않음)');
        }

        // 3. Save Questions
        const courseObj = window.allExamCourses[catIndex].courses[courseIndex];
        const newKey = `${courseObj.name}_${Date.now()}`;
        const newName = `${file.name.split('.')[0]} (업로드)`;

        const saveRes = await fetch('/api/sejong/questions-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key: newKey,
                questions: questions
            })
        });

        if(!saveRes.ok) throw new Error('추출된 데이터 저장 실패');

        // 4. Update Course Config
        courseObj.exams.push({ name: newName, key: newKey });
        await saveExamCoursesToAPI();

        // 5. Open Editor
        window.location.href = `exam_editor.html?key=${newKey}&name=${encodeURIComponent(newName)}`;

    } catch (e) {
        console.error(e);
        alert(e.message || '업로드 중 오류가 발생했습니다.');
    } finally {
        label.innerHTML = originalText;
        label.style.pointerEvents = 'auto';
        event.target.value = ''; // Reset file input
    }
};

// --- Explanation Settings Logic ---
window.explSettings = { global_enabled: false, allowed_students: [] };
window.allMembersList = [];

document.addEventListener('DOMContentLoaded', () => {
    loadExplanationSettings();
    loadExplStudents();
});

async function loadExplanationSettings() {
    try {
        const res = await fetch('/api/sejong/explanation-settings');
        if (res.ok) {
            window.explSettings = await res.json();
            document.getElementById('globalExplToggle').checked = window.explSettings.global_enabled;
            toggleExplList();
        }
    } catch (e) {
        console.error("Failed to load explanation settings:", e);
    }
}

async function loadExplStudents() {
    try {
        const res = await fetch('/api/sejong/members?t=' + Date.now());
        if (res.ok) {
            window.allMembersList = await res.json();
            populateCourseFilter();
            renderExplStudents();
        }
    } catch (e) {
        console.error("Failed to load students:", e);
    }
}

function populateCourseFilter() {
    const filter = document.getElementById('explCourseFilter');
    if (!filter) return;
    
    const courses = new Set();
    window.allMembersList.forEach(m => {
        if (m.course) courses.add(m.course);
    });
    
    let html = '<option value="ALL">모든 과정</option>';
    Array.from(courses).sort().forEach(c => {
        html += `<option value="${c}">${c}</option>`;
    });
    filter.innerHTML = html;
}

window.toggleExplList = function() {
    const isGlobal = document.getElementById('globalExplToggle').checked;
    const container = document.getElementById('explStudentListContainer');
    if (isGlobal) {
        container.style.display = 'none';
    } else {
        container.style.display = 'block';
    }
};

window.renderExplStudents = function() {
    const container = document.getElementById('explStudentsList');
    if (!container) return;
    
    const selectedCourse = document.getElementById('explCourseFilter').value;
    
    let filtered = window.allMembersList;
    if (selectedCourse !== 'ALL') {
        filtered = filtered.filter(m => m.course === selectedCourse);
    }
    
    // Sort students by name
    const sorted = [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    let html = '';
    sorted.forEach(m => {
        const identifier = m.phone || m.id; // use phone if available, fallback to id
        const isChecked = window.explSettings.allowed_students.includes(identifier);
        
        html += `
            <label style="display:flex; align-items:center; gap:8px; padding:8px; background:white; border:1px solid #cbd5e1; border-radius:6px; cursor:pointer;">
                <input type="checkbox" class="expl-student-checkbox" value="${identifier}" ${isChecked ? 'checked' : ''} onchange="updateExplStudent(this)">
                <span style="font-size:0.9rem; color:#334155;"><b>${m.name}</b> <span style="color:#94a3b8; font-size:0.8rem;">(${m.course || '미분류'})</span></span>
            </label>
        `;
    });
    container.innerHTML = html;
};

window.updateExplStudent = function(checkbox) {
    const id = checkbox.value;
    if (checkbox.checked) {
        if (!window.explSettings.allowed_students.includes(id)) {
            window.explSettings.allowed_students.push(id);
        }
    } else {
        window.explSettings.allowed_students = window.explSettings.allowed_students.filter(x => x !== id);
    }
};

window.checkAllExplStudents = function(checked) {
    const checkboxes = document.querySelectorAll('.expl-student-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = checked;
        window.updateExplStudent(cb);
    });
};

window.saveExplanationSettings = async function() {
    try {
        const global_enabled = document.getElementById('globalExplToggle').checked;
        const payload = { global_enabled, allowed_students: window.explSettings.allowed_students };
        
        const res = await fetch('/api/sejong/explanation-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            alert('권한 설정이 저장되었습니다.');
            window.explSettings = payload;
        } else {
            throw new Error('Save failed');
        }
    } catch (e) {
        console.error(e);
        alert('저장에 실패했습니다.');
    }
};
