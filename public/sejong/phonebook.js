
function getFetchUrl(endpoint, isPost = false) {
    const url = `/api/sejong/${endpoint}`;
    return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
}

const API_BASE = '/api/sejong';

let members = [];
let uniqueCourses = [];
let uniqueYears = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchMembers();

    // Event listeners for filters
    const nameInput = document.getElementById('phoneSearchInput');
    const courseFilter = document.getElementById('courseFilter');
    const yearFilter = document.getElementById('yearFilter');
    const monthFilter = document.getElementById('monthFilter');
    const dayFilter = document.getElementById('dayFilter');

    [nameInput, courseFilter, yearFilter, monthFilter, dayFilter].forEach(el => {
        if (el) el.addEventListener('input', () => renderPhonebook());
    });
});

async function fetchMembers() {
    try {
        const res = await fetch(getFetchUrl('members'));
        members = await res.json();

        // Filter out inactive statuses (keep trash and delete as requested)
        members = members.filter(m => m.status !== 'completed' && m.status !== 'hold');

        // Extract unique courses and years
        const courseSet = new Set();
        const yearSet = new Set();

        members.forEach(m => {
            if (m.course) {
                m.course.split(',').forEach(c => courseSet.add(c.trim()));
            }
            if (m.registeredDate) {
                const year = m.registeredDate.substring(0, 4);
                if (year && year.length === 4) yearSet.add(year);
            }
        });

        uniqueCourses = Array.from(courseSet).sort();
        uniqueYears = Array.from(yearSet).sort((a, b) => b - a); // Descending

        populateFilters();
        renderPhonebook();
    } catch (err) {
        console.error('Fetch error:', err);
        document.getElementById('phonebookContainer').innerHTML = '<div style="color:red; text-align:center;">데이터를 불러오지 못했습니다.</div>';
    }
}

function populateFilters() {
    const cf = document.getElementById('courseFilter');
    const yf = document.getElementById('yearFilter');

    if (cf) {
        uniqueCourses.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            cf.appendChild(opt);
        });
    }

    if (yf) {
        uniqueYears.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y + '년';
            yf.appendChild(opt);
        });
    }
}

function getChosung(name) {
    if (!name) return '?';
    const chosungs = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    const charCode = name.charCodeAt(0) - 44032;
    if (charCode < 0 || charCode > 11171) return name.charAt(0).toUpperCase();
    return chosungs[Math.floor(charCode / 588)];
}

let currentChosung = 'ㄱ';
let currentPage = 0;
const ITEMS_PER_PAGE = 12;
const ALL_CHOSUNGS = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ', '기타'];
let currentGrouped = {};

function renderPhonebook() {
    const nameTerm = document.getElementById('phoneSearchInput')?.value.toLowerCase() || '';
    const courseTerm = document.getElementById('courseFilter')?.value || '';
    const yearTerm = document.getElementById('yearFilter')?.value || '';
    const monthTerm = document.getElementById('monthFilter')?.value || '';
    const dayTerm = document.getElementById('dayFilter')?.value || '';

    const filtered = members.filter(m => {
        const nameMatch = m.name.toLowerCase().includes(nameTerm) || (m.phone && m.phone.replace(/-/g, '').includes(nameTerm));
        const courseMatch = !courseTerm || (m.course && m.course.includes(courseTerm));
        
        const yearMatch = !yearTerm || (m.registeredDate && m.registeredDate.startsWith(yearTerm));
        
        let monthMatch = true;
        let dayMatch = true;
        if (m.registeredDate && m.registeredDate.length >= 10) {
            const parts = m.registeredDate.split('-');
            if (parts.length >= 3) {
                if (monthTerm && parts[1] !== monthTerm) monthMatch = false;
                if (dayTerm && parts[2] !== dayTerm) dayMatch = false;
            } else {
                if (monthTerm || dayTerm) monthMatch = false;
            }
        } else {
            if (monthTerm || dayTerm) monthMatch = false;
        }

        return nameMatch && courseMatch && yearMatch && monthMatch && dayMatch;
    });

    // Reset grouping
    currentGrouped = {};
    ALL_CHOSUNGS.forEach(cs => currentGrouped[cs] = []);

    filtered.sort((a, b) => a.name.localeCompare(b.name, 'ko')).forEach(m => {
        let cs = getChosung(m.name);
        if (!ALL_CHOSUNGS.includes(cs)) cs = '기타';
        currentGrouped[cs].push(m);
    });

    // Find the first chosung that has members if searching
    if (nameTerm || courseTerm || yearTerm || monthTerm || dayTerm) {
        const firstWithData = ALL_CHOSUNGS.find(cs => currentGrouped[cs].length > 0);
        if (firstWithData) {
            currentChosung = firstWithData;
            currentPage = 0;
        }
    } else {
        // If empty group selected naturally, that's fine, but if we just loaded, stay on ㄱ
        if (!currentGrouped[currentChosung] && currentGrouped['ㄱ']) {
            currentChosung = 'ㄱ';
            currentPage = 0;
        }
    }

    renderTabs();
    renderPage();
}

function renderTabs() {
    const tabsContainer = document.getElementById('indexTabs');
    if (!tabsContainer) return;
    
    tabsContainer.innerHTML = '';
    
    // Colorful tab palette based on the user's reference image
    const tabColors = [
        { bg: '#f97316', text: '#ffffff' }, // Orange
        { bg: '#facc15', text: '#334155' }, // Yellow
        { bg: '#22c55e', text: '#ffffff' }, // Green
        { bg: '#a855f7', text: '#ffffff' }, // Purple
        { bg: '#ec4899', text: '#ffffff' }  // Pink
    ];
    
    ALL_CHOSUNGS.forEach((cs, index) => {
        const count = currentGrouped[cs]?.length || 0;
        const colorObj = tabColors[index % tabColors.length];

        const tab = document.createElement('div');
        tab.className = `index-tab ${cs === currentChosung ? 'active' : ''}`;
        tab.style.setProperty('--tab-bg', colorObj.bg);
        tab.style.setProperty('--tab-text', colorObj.text);

        tab.innerHTML = `${cs} <span style="font-size:0.65rem; opacity:0.8; display:block;">${count > 0 ? count : ''}</span>`;
        tab.onclick = () => {
            currentChosung = cs;
            currentPage = 0;
            renderTabs();
            renderPage();
        };
        tabsContainer.appendChild(tab);
    });
}

function renderPage() {
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
            <div class="phone-card" style="display: flex; align-items: stretch; justify-content: flex-start; padding: 0;">
                
                <!-- Left Column: Name & Reg Date -->
                <div style="width: 100px; display: flex; flex-direction: column; justify-content: center; border-right: 1px solid #e2e8f0; padding: 0 10px; flex-shrink: 0;">
                    <span class="member-name" style="font-weight: 600; font-size: 0.8rem;">${m.name}</span>
                    <span class="member-reg-date" style="font-size: 0.5rem; color: #94a3b8; margin-top: 2px;">${regDateText}</span>
                </div>
                
                <!-- Middle Column: Contact Info -->
                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2px; border-right: 1px solid #e2e8f0; min-width: 180px; padding: 0 10px;">
                    <div class="contact-box" style="display: flex; align-items: center; height: auto;">
                        <span class="contact-label" style="width: 30px; font-size: 0.5rem; padding: 1px 4px; flex-shrink: 0;">본인</span>
                        <span class="phone-number" style="font-weight: 500; font-size: 0.65rem; width: 95px; margin-left: 6px; flex-shrink: 0;">${m.phone || '-'}</span>
                        ${getPhoneButtons(m.phone, coursesStr)}
                    </div>
                    <div class="contact-box" style="display: flex; align-items: center; height: auto;">
                        <span class="contact-label guardian" style="width: 30px; font-size: 0.5rem; padding: 1px 4px; flex-shrink: 0;">부모</span>
                        <span class="phone-number" style="font-weight: 500; font-size: 0.65rem; width: 95px; margin-left: 6px; flex-shrink: 0;">${m.phone_guardian || '-'}</span>
                        ${getPhoneButtons(m.phone_guardian, coursesStr)}
                    </div>
                </div>

                <!-- Right Column: Courses -->
                <div class="course-badge-list" style="width: 180px; display: flex; align-items: center; justify-content: flex-start; padding: 0 10px; gap: 4px; flex-wrap: wrap; margin-left: auto;">
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
}

window.changePage = function(delta) {
    currentPage += delta;
    renderPage();
};
