import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/phonebook.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Update ITEMS_PER_PAGE to 64
js = js.replace('const ITEMS_PER_PAGE = 12;', 'const ITEMS_PER_PAGE = 64;')

# Update renderPage
old_renderPage = """function renderPage() {
    const container = document.getElementById('phonebookContainer');
    if (!container) return;
    
    // Clear and force animation trigger by replacing the inner HTML entirely
    const items = currentGrouped[currentChosung] || [];
    
    if (items.length === 0) {
        container.innerHTML = `
            <div class="notebook-page active">
                <div class="page-header">
                    <h2 class="page-title">${currentChosung}</h2>
                </div>
                <div style="text-align:center; padding:50px; color:#94a3b8; font-size:1rem; margin-top:50px;">해당 초성에 수강생이 없습니다.</div>
            </div>
        `;
        return;
    }

    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    if (currentPage >= totalPages) currentPage = totalPages - 1;
    if (currentPage < 0) currentPage = 0;
    
    const startIdx = currentPage * ITEMS_PER_PAGE;
    const pageItems = items.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    let html = `
        <div class="notebook-page active">
            <div class="page-header">
                <h2 class="page-title">${currentChosung}</h2>
            </div>
            <div class="phone-card-list">
    `;

    pageItems.forEach(m => {
        const coursesStr = m.course || '';
        const courseBadges = coursesStr ? coursesStr.split(',').map(c => `
            <div class="course-badge">
                <i class="material-icons">menu_book</i>
                ${c.trim()}
            </div>
        `).join('') : '';

        const getPhoneButtons = (phone, courseName) => {
            if (!phone) return '';
            return `
                <div class="card-actions" style="gap: 2px; margin-left: 2px;">
                    <button class="action-icon-btn call" onclick="window.location.href='tel:${phone}'" title="전화 걸기">
                        <i class="material-icons">call</i>
                    </button>
                    <button class="action-icon-btn sms" onclick="window.location.href='sms:${phone}'" title="문자 보내기">
                        <i class="material-icons">chat_bubble</i>
                    </button>
                </div>
            `;
        };

        const regDateText = m.registeredDate ? m.registeredDate.replace(/-/g, '.') : '';

        html += `
            <div class="phone-card" style="display: flex; align-items: center; justify-content: flex-start; padding: 4px 0;">
                
                <!-- Left Column: Name & Reg Date -->
                <div style="width: 100px; display: flex; flex-direction: column; justify-content: center; border-right: 1px solid #e2e8f0; padding: 0 10px; flex-shrink: 0;">
                    <span class="member-name" style="font-weight: 600; font-size: 0.8rem;">${m.name}</span>
                    <span class="member-reg-date" style="font-size: 0.35rem; color: #94a3b8; margin-top: 2px;">${regDateText}</span>
                </div>
                
                <!-- Middle Column: Contact Info (Row layout now) -->
                <div style="flex: 1; display: flex; flex-direction: row; align-items: center; justify-content: flex-start; gap: 15px; border-right: 1px solid #e2e8f0; min-width: 250px; padding: 0 10px;">
                    <div class="contact-box" style="display: flex; align-items: center; height: auto;">
                        <span class="contact-label" style="width: 25px; font-size: 0.4rem; padding: 1px 3px; flex-shrink: 0;">본인</span>
                        <span class="phone-number" style="font-weight: 500; font-size: 0.5rem; margin-left: 4px; flex-shrink: 0;">${m.phone || '-'}</span>
                        ${getPhoneButtons(m.phone, coursesStr)}
                    </div>
                    <div class="contact-box" style="display: flex; align-items: center; height: auto;">
                        <span class="contact-label guardian" style="width: 25px; font-size: 0.4rem; padding: 1px 3px; flex-shrink: 0;">부모</span>
                        <span class="phone-number" style="font-weight: 500; font-size: 0.5rem; margin-left: 4px; flex-shrink: 0;">${m.phone_guardian || '-'}</span>
                        ${getPhoneButtons(m.phone_guardian, coursesStr)}
                    </div>
                </div>

                <!-- Right Column: Courses -->
                <div class="course-badge-list" style="width: 160px; display: flex; align-items: center; justify-content: flex-start; padding: 0 10px; gap: 4px; flex-wrap: wrap; margin-left: auto;">
                    ${courseBadges}
                </div>
            </div>
        `;
    });

    html += `</div>`; // end phone-card-list

    if (totalPages > 1) {
        html += `
            <div class="pagination-controls">
                <button class="page-btn" onclick="changePage(-1)" ${currentPage === 0 ? 'disabled' : ''}>
                    <i class="material-icons">chevron_left</i> 이전
                </button>
                <span class="page-indicator">${currentPage + 1} / ${totalPages}</span>
                <button class="page-btn" onclick="changePage(1)" ${currentPage === totalPages - 1 ? 'disabled' : ''}>
                    다음 <i class="material-icons">chevron_right</i>
                </button>
            </div>
        `;
    }

    html += `</div>`; // end notebook-page
    container.innerHTML = html;
}"""

# New renderPage using the 2-page layout
new_renderPage = """function renderPage() {
    const leftPage = document.getElementById('phonebookPageLeft');
    const rightPage = document.getElementById('phonebookPageRight');
    if (!leftPage || !rightPage) return;
    
    const items = currentGrouped[currentChosung] || [];
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE) || 1;
    if (currentPage >= totalPages) currentPage = totalPages - 1;
    if (currentPage < 0) currentPage = 0;
    
    const startIdx = currentPage * ITEMS_PER_PAGE;
    const pageItems = items.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    // Split items for left and right pages
    const leftItems = pageItems.slice(0, 32);
    const rightItems = pageItems.slice(32, 64);

    function buildPageHTML(pageItems, isLeft) {
        let html = `
            <div class="page-header">
                <h2 class="page-title">${isLeft ? currentChosung : ''}</h2>
            </div>
            <div class="phone-card-list" style="margin-top: 36px;">
        `;

        if (pageItems.length === 0 && isLeft && items.length === 0) {
            html += `<div style="text-align:center; padding:50px; color:#94a3b8; font-family:'Noto Sans KR',sans-serif; margin-left: 20px;">해당 초성에 수강생이 없습니다.</div>`;
        }

        pageItems.forEach(m => {
            const coursesStr = m.course || '';
            const courseBadges = coursesStr ? coursesStr.split(',').map(c => `
                <div class="course-badge">
                    ${c.trim()}
                </div>
            `).join('') : '';

            const getPhoneButtons = (phone) => {
                if (!phone) return '';
                return `
                    <div class="card-actions" style="gap: 2px; margin-left: 2px;">
                        <button class="action-icon-btn call" onclick="window.location.href='tel:${phone}'" title="전화 걸기">
                            <i class="material-icons">call</i>
                        </button>
                        <button class="action-icon-btn sms" onclick="window.location.href='sms:${phone}'" title="문자 보내기">
                            <i class="material-icons">chat_bubble</i>
                        </button>
                    </div>
                `;
            };

            const regDateText = m.registeredDate ? m.registeredDate.replace(/-/g, '.') : '';

            html += `
                <div class="phone-card" style="display: flex; align-items: center; justify-content: flex-start; padding: 0;">
                    
                    <div style="width: 70px; display: flex; align-items:baseline; padding-left:25px; flex-shrink: 0; gap:5px;">
                        <span class="member-name" style="font-weight: 600; font-size: 19px; font-family:'Nanum Pen Script',cursive; color:#334155;">${m.name}</span>
                        <span class="member-reg-date" style="font-size: 14px; color: #64748b; font-family:'Nanum Pen Script',cursive;">${regDateText}</span>
                    </div>
                    
                    <div style="flex: 1; display: flex; flex-direction: row; align-items: center; justify-content: flex-start; gap: 8px; min-width: 180px; padding: 0 5px;">
                        <div class="contact-box" style="display: flex; align-items: center;">
                            <span class="contact-label" style="font-family:'Noto Sans KR',sans-serif;">본인</span>
                            <span class="phone-number" style="font-family:'Nanum Pen Script',cursive; font-size: 18px; color:#334155; margin-left: 4px;">${m.phone || '-'}</span>
                            ${getPhoneButtons(m.phone)}
                        </div>
                        <div class="contact-box" style="display: flex; align-items: center;">
                            <span class="contact-label guardian" style="font-family:'Noto Sans KR',sans-serif;">부모</span>
                            <span class="phone-number" style="font-family:'Nanum Pen Script',cursive; font-size: 18px; color:#334155; margin-left: 4px;">${m.phone_guardian || '-'}</span>
                            ${getPhoneButtons(m.phone_guardian)}
                        </div>
                    </div>

                    <div class="course-badge-list" style="width: 120px; display: flex; align-items: center; justify-content: flex-start; gap: 4px; flex-wrap: wrap; margin-left: auto;">
                        ${courseBadges}
                    </div>
                </div>
            `;
        });

        // Fill remaining empty lines up to 32
        for (let i = pageItems.length; i < 32; i++) {
            html += `<div class="phone-card" style="display:flex; padding-left:25px;"></div>`;
        }

        html += `</div>`; // end phone-card-list

        if (isLeft && totalPages > 1) {
            html += `
                <div class="pagination-controls" style="position:absolute; bottom:-10px; left:0; right:0; justify-content:center; display:flex;">
                    <button class="page-btn" onclick="changePage(-1)" ${currentPage === 0 ? 'disabled' : ''}>
                        <i class="material-icons">chevron_left</i> 이전
                    </button>
                    <span class="page-indicator" style="margin:0 15px;">${currentPage + 1} / ${totalPages}</span>
                    <button class="page-btn" onclick="changePage(1)" ${currentPage === totalPages - 1 ? 'disabled' : ''}>
                        다음 <i class="material-icons">chevron_right</i>
                    </button>
                </div>
            `;
        }

        return html;
    }

    leftPage.innerHTML = buildPageHTML(leftItems, true);
    rightPage.innerHTML = buildPageHTML(rightItems, false);
}"""

js = js.replace(old_renderPage, new_renderPage)

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/phonebook.js', 'w', encoding='utf-8') as f:
    f.write(js)

