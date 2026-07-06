// sidebar_sync.js
// 이 스크립트는 모든 HTML 페이지에 삽입되어,
// 왼쪽 사이드바의 "시험지" 및 연동되는 과목 메뉴를 '/api/sejong/settings'를 기반으로 동적 생성합니다.

window.syncSidebar = async function (forceData = null) {
    try {
        let allExamCourses = [];
        if (forceData) {
            allExamCourses = forceData;
        } else {
            const res = await fetch(`/api/sejong/exam-courses?t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                if(Array.isArray(data) && data.length > 0 && typeof data[0] === 'string') {
                    allExamCourses = [{category: '기본과정', courses: data}];
                } else if(Array.isArray(data)) {
                    allExamCourses = data;
                }
            } else {
                return;
            }
        }

        const categories = document.querySelectorAll('.sidebar-nav .nav-category');
        let examMenu = null;
        for (let cat of categories) {
            if (cat.textContent.trim() === '시험지') {
                examMenu = cat.nextElementSibling;
                break;
            }
        }

        // Inject AI Analyzer menu if it doesn't exist
        const navCategories = Array.from(categories);
        let sugamMenu = navCategories.find(c => c.textContent.trim() === '수강 관리');
        if (sugamMenu) {
            let aiMenu = navCategories.find(c => c.textContent.trim() === '스마트 분석');
            if (!aiMenu) {
                const aiHtml = `
                <div class="nav-category toggle-category active" onclick="toggleNavSub(this)">스마트 분석</div>
                <div class="nav-sub-menu show">
                    <a href="ai_analyzer.html" class="nav-item">🤖 AI 스마트 원서 분석</a>
                </div>`;
                sugamMenu.insertAdjacentHTML('beforebegin', aiHtml);
            }
        }

        if (examMenu && examMenu.classList.contains('nav-sub-menu')) {
            let html = '';
            
            // Try to get available auto-collected exams
            let autoExams = [];
            try {
                let db = window.EXAM_DATA_DB;
                if (!db) {
                    const qRes = await fetch(`questions_data.json?t=${Date.now()}`);
                    if (qRes.ok) db = await qRes.json();
                }
                if (db) {
                    autoExams = Object.keys(db).filter(k => k.includes('자동수집'));
                }
            } catch (e) { console.error("Failed to load auto exams for sidebar", e); }

            allExamCourses.forEach(catObj => {
                // Category Level
                html += `<div class="nav-category toggle-category" onclick="if(typeof toggleNavSub === 'function') toggleNavSub(this)">📁 ${catObj.category}</div>\n`;
                html += `<div class="nav-sub-menu">\n`;
                
                if (catObj.category === '전체과정') {
                    if (autoExams.length > 0) {
                        html += `    <div class="nav-category toggle-category" onclick="if(typeof toggleNavSub === 'function') toggleNavSub(this)" style="padding-left: 20px; font-size: 0.9rem;">기출 자동수집</div>\n`;
                        html += `    <div class="nav-sub-menu">\n`;
                        autoExams.forEach(key => {
                            let displayName = key.split('자동수집_').pop().replace('.hwp', '').replace('.pdf', '');
                            if (displayName.length > 18) displayName = displayName.substring(0, 18) + '...';
                            html += `        <a href="javascript:void(0)" onclick="if(typeof loadExamView === 'function') loadExamView('${key}')" class="nav-item" style="padding-left: 30px;" title="${key}">${displayName}</a>\n`;
                        });
                        html += `    </div>\n`;
                    } else {
                        html += `    <a href="javascript:void(0)" class="nav-item" style="padding-left: 20px; color:#94a3b8;">과정 없음</a>\n`;
                    }
                } else if (catObj.courses && catObj.courses.length > 0) {
                    catObj.courses.forEach(course => {
                        let prefix = course.replace("기능사", "");
                        if (course === "제과제빵기능사") prefix = "제과제빵";
                        
                        // Sub-course Level
                        html += `    <div class="nav-category toggle-category" onclick="if(typeof toggleNavSub === 'function') toggleNavSub(this)" style="padding-left: 20px; font-size: 0.9rem;">${course}</div>\n`;
                        html += `    <div class="nav-sub-menu">\n`;
                        
                        // 기본 과목 중 시험이 없는 항목은 준비중 표시 유지
                        if (["산업기사", "가정요리", "브런치", "쿠킹클래스", "베이킹 원데이", "취미요리"].includes(course)) {
                            html += `        <a href="javascript:void(0)" class="nav-item" style="padding-left: 30px;">준비중입니다</a>\n`;
                        } else {
                            for (let year = 2021; year <= 2026; year++) {
                                html += `        <a href="javascript:void(0)" onclick="if(typeof loadExamView === 'function') loadExamView('${prefix}_${year}')" class="nav-item" style="padding-left: 30px;">${year}년 ${prefix}</a>\n`;
                            }
                        }
                        html += `    </div>\n`;
                    });
                } else {
                    html += `    <a href="javascript:void(0)" class="nav-item" style="padding-left: 20px; color:#94a3b8;">과정 없음</a>\n`;
                }
                
                html += `</div>\n`;
            });
            examMenu.innerHTML = html;
        }
    } catch (e) {
        console.error("Sidebar sync error:", e);
    }
};

// 페이지 로드 완료 시 즉시 사이드바를 최신 과목 데이터로 동기화합니다.
document.addEventListener("DOMContentLoaded", () => {
    window.syncSidebar();
});
