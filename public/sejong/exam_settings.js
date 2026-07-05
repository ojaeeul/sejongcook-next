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
            catObj.courses.forEach((course, courseIndex) => {
                let prefix = course.replace("기능사", "");
                if (course === "제과제빵기능사") prefix = "제과제빵";

                let yearsHtml = '';
                if (["산업기사", "가정요리", "브런치", "쿠킹클래스", "베이킹 원데이", "취미요리"].includes(course)) {
                    yearsHtml = `<div style="padding: 4px 10px; color:#94a3b8; font-size: 0.85rem;">준비중입니다</div>`;
                } else {
                    for (let year = 2021; year <= 2026; year++) {
                        yearsHtml += `<div style="padding: 4px 10px; color:#64748b; font-size: 0.85rem;">📄 ${year}년 ${prefix}</div>`;
                    }
                }

                html += `
                    <div style="border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px; margin-bottom: 8px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; padding: 6px 0;">
                            <span style="color:#334155; margin-left: 10px; cursor:pointer; font-weight: 500;" onclick="const el = this.parentElement.nextElementSibling; el.style.display = el.style.display === 'none' ? 'block' : 'none';">📂 ${course} (소분류 폴더) ▼</span>
                            <button onclick="deleteExamCourseFromCategory(${catIndex}, ${courseIndex})" style="background:#f87171; color:white; border:none; padding:2px 6px; border-radius:4px; cursor:pointer; font-size:0.75rem;"><i class="fas fa-times"></i> 삭제</button>
                        </div>
                        <div style="display:none; margin-left: 28px; background: #f1f5f9; padding: 8px; border-radius: 4px; border-left: 2px solid #cbd5e1; margin-top: 4px;">
                            ${yearsHtml}
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
        if(cat.courses.includes(newCourse)) exists = true;
    });

    if(exists) {
        alert("이미 다른 폴더에 존재하는 과정 이름입니다.");
        return;
    }

    window.allExamCourses[catIndex].courses.push(newCourse);
    saveExamCoursesToAPI();
};

window.deleteExamCategory = function(catIndex) {
    const catName = window.allExamCourses[catIndex].category;
    if(!confirm(`'${catName}' 폴더와 그 안의 모든 과정을 삭제하시겠습니까?`)) return;

    window.allExamCourses.splice(catIndex, 1);
    saveExamCoursesToAPI();
};

window.deleteExamCourseFromCategory = function(catIndex, courseIndex) {
    const courseName = window.allExamCourses[catIndex].courses[courseIndex];
    if(!confirm(`'${courseName}' 과정을 삭제하시겠습니까?`)) return;

    window.allExamCourses[catIndex].courses.splice(courseIndex, 1);
    saveExamCoursesToAPI();
};
