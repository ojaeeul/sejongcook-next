// sidebar_sync.js
// 이 스크립트는 모든 HTML 페이지에 삽입되어,
// 왼쪽 사이드바의 "시험지" 및 연동되는 과목 메뉴를 '/api/sejong/settings'를 기반으로 동적 생성합니다.

window.syncSidebar = async function (forceData = null) {
    try {
        let courses = [];
        if (forceData && forceData.courses) {
            courses = forceData.courses;
        } else {
            const res = await fetch(`/api/sejong/settings?t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                let settings = Array.isArray(data) && data.length > 0 ? data[0] : (data.key === "settings" ? data.value : data);
                courses = settings.courses || ["한식기능사", "양식기능사", "일식기능사", "중식기능사", "제과기능사", "제빵기능사", "제과제빵기능사", "복어기능사", "산업기사", "가정요리", "브런치"];
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
            courses.forEach(course => {
                let prefix = course.replace("기능사", "");
                if (course === "제과제빵기능사") prefix = "제과제빵";
                
                html += `<div class="nav-category toggle-category" onclick="if(typeof toggleNavSub === 'function') toggleNavSub(this)">${course}</div>\n`;
                html += `<div class="nav-sub-menu">\n`;
                
                // 기본 과목 중 시험이 없는 항목은 준비중 표시 유지
                if (["산업기사", "가정요리", "브런치"].includes(course)) {
                    html += `    <a href="javascript:void(0)" class="nav-item">준비중입니다</a>\n`;
                } else {
                    for (let year = 2021; year <= 2026; year++) {
                        html += `    <a href="javascript:void(0)" onclick="if(typeof loadExamView === 'function') loadExamView('${prefix}_${year}')" class="nav-item">${year}년 ${prefix}</a>\n`;
                    }
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
