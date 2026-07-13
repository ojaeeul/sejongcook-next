const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000/api' : '/api/sejong';

let members = [];
let uniqueCourses = [];
let uniqueYears = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchMembers();

    // Event listeners for filters
    const nameInput = document.getElementById('phoneSearchInput');
    const courseFilter = document.getElementById('courseFilter');
    const yearFilter = document.getElementById('yearFilter');

    [nameInput, courseFilter, yearFilter].forEach(el => {
        if (el) el.addEventListener('input', () => renderPhonebook());
    });
});

async function fetchMembers() {
    try {
        const res = await fetch(`${API_BASE}/members`);
        members = await res.json();

        // Filter out inactive statuses
        members = members.filter(m => m.status !== 'trash' && m.status !== 'delete');

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

function renderPhonebook() {
    const nameTerm = document.getElementById('phoneSearchInput')?.value.toLowerCase() || '';
    const courseTerm = document.getElementById('courseFilter')?.value || '';
    const yearTerm = document.getElementById('yearFilter')?.value || '';

    const container = document.getElementById('phonebookContainer');
    container.innerHTML = '';

    const filtered = members.filter(m => {
        const nameMatch = m.name.toLowerCase().includes(nameTerm) || (m.phone && m.phone.replace(/-/g, '').includes(nameTerm));
        const courseMatch = !courseTerm || (m.course && m.course.includes(courseTerm));
        const yearMatch = !yearTerm || (m.registeredDate && m.registeredDate.startsWith(yearTerm));
        return nameMatch && courseMatch && yearMatch;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center; padding:50px; color:#94a3b8; font-size:0.9rem;">검색 결과가 없습니다.</div>';
        return;
    }

    // Group by chosung
    const grouped = {};
    filtered.sort((a, b) => a.name.localeCompare(b.name, 'ko')).forEach(m => {
        const cs = getChosung(m.name);
        if (!grouped[cs]) grouped[cs] = [];
        grouped[cs].push(m);
    });

    Object.keys(grouped).sort().forEach(cs => {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'chosung-group';

        const label = document.createElement('span');
        label.className = 'chosung-label';
        label.style.fontSize = '1.1rem';
        label.style.marginBottom = '10px';
        label.textContent = cs;
        groupDiv.appendChild(label);

        const listDiv = document.createElement('div');
        listDiv.className = 'phone-card-list';

        grouped[cs].forEach(m => {
            const card = document.createElement('div');
            card.className = 'phone-card';
            card.style.padding = '12px 20px'; // Smaller padding

            const coursesStr = m.course || '';
            const courseBadges = coursesStr ? coursesStr.split(',').map(c => `
                <div class="course-badge">
                    <i class="material-icons">menu_book</i>
                    ${c.trim()}
                </div>
            `).join('') : '';

            const getPhoneButtons = (phone) => {
                if (!phone) return '';
                return `
                    <div class="card-actions">
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

            card.innerHTML = `
                <div class="card-left">
                    <div style="display: flex; flex-direction: column; min-width: 85px;">
                        <div class="member-name">${m.name}</div>
                        <div class="member-reg-date">${regDateText}</div>
                    </div>
                    <div class="contact-info">
                        <div class="contact-box">
                            <div class="contact-main">
                                <span class="contact-label">본인</span>
                                <span class="phone-number">${m.phone || '-'}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div class="course-badge-list" style="margin-right: 5px;">
                                    ${courseBadges}
                                </div>
                                ${getPhoneButtons(m.phone)}
                            </div>
                        </div>
                        ${m.phone_guardian ? `
                        <div class="contact-box">
                            <div class="contact-main">
                                <span class="contact-label guardian">보호자</span>
                                <span class="phone-number">${m.phone_guardian}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <div class="course-badge-list" style="margin-right: 5px;">
                                    <!-- Guardian doesn't have courses, so this will be empty -->
                                </div>
                                ${getPhoneButtons(m.phone_guardian)}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
            listDiv.appendChild(card);
        });

        groupDiv.appendChild(listDiv);
        container.appendChild(groupDiv);
    });
}
