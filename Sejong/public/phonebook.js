
function getFetchUrl(endpoint, isPost = false) {
    const url = `/api/sejong/${endpoint}`;
    return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
}

const API_BASE = '/api/sejong';

let allMembers = [];
let members = [];
let showingTrash = false;
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
        const response = await fetch(getFetchUrl('members'));
        allMembers = await response.json();
        
        // Filter based on view mode
        if (showingTrash) {
            members = allMembers.filter(m => m.status === 'trash');
        } else {
            members = allMembers.filter(m => m.status !== 'completed' && m.status !== 'trash');
        }

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
const ITEMS_PER_PAGE = 24;
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
    const leftItems = pageItems.slice(0, 12);
    const rightItems = pageItems.slice(12, 24);

    function buildPageHTML(pageItems, isLeft) {
        let html = `
            <div class="page-header" style="position: static; margin-bottom: 15px; border-bottom: 3px solid #3b82f6;">
                <h2 class="page-title">${isLeft ? currentChosung : ''}</h2>
            </div>
            <div class="phone-card-list" style="flex:1;">
        `;

        if (pageItems.length === 0 && isLeft && items.length === 0) {
            html += `<div style="text-align:center; padding:50px; color:#94a3b8; font-size:1rem; margin-top:50px;">해당 초성에 수강생이 없습니다.</div>`;
        }

        pageItems.forEach(m => {
            const coursesStr = m.course || '';
            const courseBadges = coursesStr ? coursesStr.split(',').map(c => `
                <div class="course-badge">
                    <i class="material-icons">menu_book</i>
                    ${c.trim()}
                </div>
            `).join('') : '';

            const getCourseBadge = (course) => {
                const colorObj = getCourseColor(course);
                return `<span style="background: white; border: 1px solid ${colorObj.bg}; color: ${colorObj.text}; padding: 1px 4px; border-radius: 50px; font-size: 0.6rem; font-weight: 600; white-space: nowrap; box-shadow: 0 1px 2px rgba(0,0,0,0.05); display: inline-flex; align-items: center; gap: 2px; line-height: 1;">
                    <i class="material-icons" style="font-size: 0.6rem;">domain</i> ${course}
                </span>`;
            };

            const getPhoneButtons = (phone, courseName) => {
                if (!phone) return '';
                return `
                    <div class="card-actions" style="gap: 2px; margin-left: 2px;">
                        <button class="action-icon-btn call" onclick="window.location.href='tel:${phone}'" title="전화 걸기" style="width: 14px; height: 14px;">
                            <i class="material-icons" style="font-size: 9px;">call</i>
                        </button>
                        <button class="action-icon-btn sms" onclick="window.location.href='sms:${phone}'" title="문자 보내기" style="width: 14px; height: 14px;">
                            <i class="material-icons" style="font-size: 9px;">chat_bubble</i>
                        </button>
                    </div>
                `;
            };

            const regDateText = m.registeredDate ? m.registeredDate.replace(/-/g, '.') : '';

            html += `
                <div class="phone-card" style="display: flex; align-items: center; justify-content: flex-start; padding: 0; height: 40px; overflow: hidden;">
                    
                    <!-- Left Column: Name & Reg Date -->
                    <div style="width: 90px; display: flex; flex-direction: column; justify-content: center; border-right: 1px solid #e2e8f0; padding: 0 10px; flex-shrink: 0; height: 100%;">
                        <div style="display: flex; align-items: center; gap: 2px;">
                            <span class="member-name" style="font-size: 0.8rem; line-height: 1;">${m.name}</span>
                        </div>
                        <span class="member-reg-date" style="margin-top: 2px; font-size: 0.6rem; line-height: 1;">${regDateText}</span>
                    </div>
                    
                    <!-- Middle Column: Contact Info (Column layout for tight fitting) -->
                    <div style="flex: 1; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 1px; border-right: 1px solid #e2e8f0; min-width: 200px; padding: 0 10px; height: 100%;">
                        <div class="contact-box" style="display: flex; align-items: center; height: auto; width: 100%;">
                            <span style="font-size: 0.7rem; font-weight: 700; color: #1e40af; width: 22px; flex-shrink: 0; line-height: 1;">(본)</span>
                            <span class="phone-number" style="margin-left: 2px; flex-shrink: 0; width: 95px; font-size: 0.75rem; line-height: 1; cursor: pointer; text-decoration: underline; text-decoration-color: #cbd5e1; text-underline-offset: 2px;" onclick="editPhonebookNumber('${m.id}', 'phone')" title="전화번호 수정">${m.phone || '-'}</span>
                            ${getPhoneButtons(m.phone, coursesStr)}
                        </div>
                        <div class="contact-box" style="display: flex; align-items: center; height: auto; width: 100%;">
                            <span style="font-size: 0.7rem; font-weight: 700; color: #475569; width: 22px; flex-shrink: 0; line-height: 1;">(부)</span>
                            <span class="phone-number" style="margin-left: 2px; flex-shrink: 0; width: 95px; font-size: 0.75rem; line-height: 1; cursor: pointer; text-decoration: underline; text-decoration-color: #cbd5e1; text-underline-offset: 2px;" onclick="editPhonebookNumber('${m.id}', 'phone_guardian')" title="부모님 전화번호 수정">${m.phone_guardian || '-'}</span>
                            ${getPhoneButtons(m.phone_guardian, coursesStr)}
                        </div>
                    </div>

                    <!-- Right Column: Courses -->
                    <div class="course-badge-list hide-scrollbar" style="flex: 1; min-width: 110px; max-width: 150px; display: flex; flex-direction: row; flex-wrap: wrap; align-items: flex-start; align-content: flex-start; justify-content: flex-start; padding: 2px 5px; gap: 2px; overflow-y: auto; overflow-x: hidden; margin-left: auto; cursor: pointer; height: 100%; border-right: 1px solid #e2e8f0;" onclick="showCourseOverlay(this, '${m.name}', '${coursesStr}')" title="크게 보기">
                        ${courseBadges}
                    </div>

                    <!-- Action Column: Edit & Delete -->
                    <div style="width: 70px; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 0 10px; flex-shrink: 0; height: 100%;">
                        ${showingTrash ? `
                            <span onclick="restorePhonebookMember('${m.id}')" style="cursor: pointer; color: #10b981;" title="복구"><i class="material-icons" style="font-size: 1.1rem;">restore</i></span>
                            <span onclick="deletePermanentPhonebook('${m.id}')" style="cursor: pointer; color: #ef4444;" title="완전 삭제"><i class="material-icons" style="font-size: 1.1rem;">delete_forever</i></span>
                        ` : `
                            <span onclick="openEditMemberModal('${m.id}')" style="cursor: pointer; color: #3b82f6;" title="정보 수정"><i class="material-icons" style="font-size: 1.1rem;">edit</i></span>
                            <span onclick="moveToTrashPhonebook('${m.id}')" style="cursor: pointer; color: #ef4444;" title="삭제"><i class="material-icons" style="font-size: 1.1rem;">delete</i></span>
                        `}
                    </div>
                </div>
            `;
        });

        // Add empty lines to maintain 12 items height
        for (let i = pageItems.length; i < 12; i++) {
            html += `<div class="phone-card" style="height: 40px;"></div>`;
        }

        html += `</div>`; // end phone-card-list

        

        return html;
    }

    leftPage.innerHTML = buildPageHTML(leftItems, true);
    rightPage.innerHTML = buildPageHTML(rightItems, false);
}

window.changePage = function(delta) {
    currentPage += delta;
    renderPage();
};


function showCourseOverlay(element, studentName, coursesStr) {
    if (!coursesStr) return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.backdropFilter = 'blur(2px)';
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '30px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    modal.style.maxWidth = '80%';
    modal.style.minWidth = '300px';
    modal.style.textAlign = 'center';
    modal.style.transform = 'scale(0.9)';
    modal.style.transition = 'transform 0.2s ease-out';
    
    // Title
    const title = document.createElement('h3');
    title.style.margin = '0 0 20px 0';
    title.style.color = '#1e293b';
    title.style.fontSize = '1.2rem';
    title.textContent = studentName + ' 수강 과정';
    modal.appendChild(title);
    
    // Badges container
    const badgeContainer = document.createElement('div');
    badgeContainer.style.display = 'flex';
    badgeContainer.style.flexWrap = 'wrap';
    badgeContainer.style.justifyContent = 'center';
    badgeContainer.style.gap = '10px';
    
    const courses = coursesStr.split(',');
    courses.forEach(c => {
        const badge = document.createElement('div');
        badge.style.fontSize = '1.1rem';
        badge.style.color = '#3b82f6';
        badge.style.background = '#eff6ff';
        badge.style.border = '1px solid #bfdbfe';
        badge.style.padding = '10px 16px';
        badge.style.borderRadius = '20px';
        badge.style.fontWeight = '600';
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.gap = '6px';
        
        const icon = document.createElement('i');
        icon.className = 'material-icons';
        icon.style.fontSize = '1.2rem';
        icon.textContent = 'menu_book';
        
        badge.appendChild(icon);
        badge.appendChild(document.createTextNode(c.trim()));
        badgeContainer.appendChild(badge);
    });
    
    modal.appendChild(badgeContainer);
    
    // Close instruction
    const hint = document.createElement('div');
    hint.style.marginTop = '20px';
    hint.style.fontSize = '0.85rem';
    hint.style.color = '#94a3b8';
    hint.textContent = '화면을 터치하면 닫힙니다.';
    modal.appendChild(hint);
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Animate pop
    requestAnimationFrame(() => {
        modal.style.transform = 'scale(1)';
    });
    
    // Close on click
    overlay.addEventListener('click', () => {
        modal.style.transform = 'scale(0.9)';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.2s ease';
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 200);
    });
}

function updatePaginationUI() {
    const controls = document.querySelector('.pagination-controls');
    const prevBtn = document.getElementById('phonebook-prev-btn');
    const nextBtn = document.getElementById('phonebook-next-btn');
    const indicator = document.getElementById('phonebook-page-indicator');

    if (totalPages > 1) {
        if (controls) controls.style.display = 'flex';
        if (prevBtn) prevBtn.disabled = currentPage === 0;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages - 1;
        if (indicator) indicator.innerHTML = `<span>${currentPage + 1}</span><span>/</span><span>${totalPages}</span>`;
    } else {
        if (controls) controls.style.display = 'none';
    }
}

window.moveToTrashPhonebook = async function(memberId) {
    if(!confirm('정말 이 수강생을 휴지통으로 이동하시겠습니까? (이동 시 모든 화면에서 숨김 처리됩니다)')) return;
    try {
        const m = members.find(m => String(m.id) === String(memberId));
        if (m) {
            m.status = 'trash';
            await fetch(getFetchUrl('members', true), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(m)
            });
            // Update UI by re-fetching
            fetchMembers();
        }
    } catch(e) { console.error(e); }
};

let currentEditMemberId = null;

window.addNewPhoneMember = function() {
    currentEditMemberId = null;
    document.getElementById('modalTitle').textContent = '새 수강생 추가';
    document.getElementById('modalSubmitBtn').textContent = '추가하기';
    document.getElementById('addMemberName').value = '';
    document.getElementById('addMemberPhone').value = '';
    document.getElementById('addMemberGuardian').value = '';
    document.getElementById('addMemberCourse').value = '';
    
    populateCourseDropdown();
    const modal = document.getElementById('addMemberModal');
    if(modal) {
        modal.style.display = 'flex';
    }
};

window.openEditMemberModal = function(id) {
    currentEditMemberId = id;
    const m = members.find(m => String(m.id) === String(id));
    if (!m) return;

    document.getElementById('modalTitle').textContent = '수강생 정보 수정';
    document.getElementById('modalSubmitBtn').textContent = '저장하기';
    
    document.getElementById('addMemberName').value = m.name || '';
    document.getElementById('addMemberPhone').value = m.phone || '';
    document.getElementById('addMemberGuardian').value = m.phone_guardian || '';
    document.getElementById('addMemberCourse').value = m.course || '';

    populateCourseDropdown();
    const modal = document.getElementById('addMemberModal');
    if(modal) {
        modal.style.display = 'flex';
    }
};

window.populateCourseDropdown = function() {
    const courseDropdown = document.getElementById('dropdownCourse');
    if (courseDropdown) {
        courseDropdown.innerHTML = ''; // clear
        if (typeof uniqueCourses !== 'undefined' && uniqueCourses.length > 0) {
            uniqueCourses.forEach(c => {
                if (!c) return;
                const div = document.createElement('div');
                div.className = 'dropdown-item';
                div.textContent = c;
                div.onmousedown = function(e) {
                    e.preventDefault(); // keep input focused
                    toggleCourseSelection(c);
                };
                courseDropdown.appendChild(div);
            });
        } else {
            const div = document.createElement('div');
            div.className = 'dropdown-item';
            div.style.color = '#94a3b8';
            div.textContent = '등록된 과정이 없습니다';
            courseDropdown.appendChild(div);
        }
    }
};

window.toggleCourseSelection = function(courseStr) {
    const input = document.getElementById('addMemberCourse');
    if (!input) return;
    let courses = input.value.split(',').map(s => s.trim()).filter(s => s);
    
    if (courses.includes(courseStr)) {
        courses = courses.filter(c => c !== courseStr);
    } else {
        if (courses.length >= 3) {
            alert('최대 3개까지만 선택할 수 있습니다.');
            return;
        }
        courses.push(courseStr);
    }
    input.value = courses.join(', ');
};

window.showCourseDropdown = function() {
    const el = document.getElementById('dropdownCourse');
    if(el) el.classList.add('show');
};

window.closeAddMemberModal = function() {
    const modal = document.getElementById('addMemberModal');
    if(modal) {
        modal.style.display = 'none';
    }
};

window.submitAddMember = async function() {
    const name = document.getElementById('addMemberName').value.trim();
    if (!name) {
        alert("이름을 입력해주세요.");
        return;
    }
    
    const phone = document.getElementById('addMemberPhone').value.trim();
    const guardian = document.getElementById('addMemberGuardian').value.trim();
    const course = document.getElementById('addMemberCourse').value.trim();

    if (currentEditMemberId) {
        const m = members.find(m => String(m.id) === String(currentEditMemberId));
        if (m) {
            m.name = name;
            m.phone = phone;
            m.phone_guardian = guardian;
            m.course = course;
            
            try {
                await fetch(getFetchUrl('members', true), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(m)
                });
                renderPhonebook();
                closeAddMemberModal();
            } catch(e) {
                console.error(e);
                alert('수정 실패');
            }
        }
    } else {
        const newMember = {
            name: name,
            phone: phone,
            phone_guardian: guardian,
            course: course,
            registeredDate: new Date().toISOString().split('T')[0],
            status: 'registered'
        };

        try {
            await fetch(getFetchUrl('members', true), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMember)
            });
            fetchMembers();
            closeAddMemberModal();
        } catch(e) {
            console.error(e);
            alert('추가 실패');
        }
    }
};

window.editPhonebookNumber = async function(memberId, field) {
    const m = members.find(m => String(m.id) === String(memberId));
    if (!m) return;
    
    const label = field === 'phone' ? '본인 전화번호' : '부모님 전화번호';
    const currentVal = m[field] || '';
    const newVal = prompt(`${m.name}의 ${label}를 수정하세요:`, currentVal);
    
    if (newVal !== null && newVal !== currentVal) {
        m[field] = newVal.trim();
        try {
            await fetch(getFetchUrl('members', true), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(m)
            });
            renderPhonebook();
        } catch(e) {
            console.error(e);
            alert('수정 실패');
        }
    }
};

window.formatPhoneNumber = function(input) {
    let value = input.value.replace(/[^0-9]/g, '');
    let formatted = '';
    
    if (value.startsWith('02')) {
        if (value.length <= 2) {
            formatted = value;
        } else if (value.length <= 5) {
            formatted = value.slice(0, 2) + '-' + value.slice(2);
        } else if (value.length <= 9) {
            formatted = value.slice(0, 2) + '-' + value.slice(2, 5) + '-' + value.slice(5);
        } else {
            formatted = value.slice(0, 2) + '-' + value.slice(2, 6) + '-' + value.slice(6, 10);
        }
    } else {
        if (value.length <= 3) {
            formatted = value;
        } else if (value.length <= 6) {
            formatted = value.slice(0, 3) + '-' + value.slice(3);
        } else if (value.length <= 10) {
            formatted = value.slice(0, 3) + '-' + value.slice(3, 6) + '-' + value.slice(6);
        } else {
            formatted = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        }
    }
    
    // Allow ending with hyphen if user types it manually (for UX smoothness)
    if (input.value.endsWith('-') && value.length === 3 && !value.startsWith('02')) {
        formatted += '-';
    } else if (input.value.endsWith('-') && value.length === 2 && value.startsWith('02')) {
        formatted += '-';
    }

    input.value = formatted;
};

window.showPhoneDropdown = function(id) {
    const el = document.getElementById(id);
    if(el) el.classList.add('show');
};

window.hidePhoneDropdown = function(id) {
    const el = document.getElementById(id);
    if(el) el.classList.remove('show');
};

window.selectPrefix = function(inputId, prefix) {
    const input = document.getElementById(inputId);
    if(input) {
        input.value = prefix;
        // Focus the input first to trigger any cursor positioning
        input.focus();
        // Fire input event to format
        formatPhoneNumber(input);
    }
};

window.toggleTrashViewPhonebook = function() {
    showingTrash = !showingTrash;
    const btn = document.getElementById('trashViewBtn');
    if (showingTrash) {
        if(btn) btn.innerHTML = `<span class="material-icons" style="font-size: 1.1rem;">arrow_back</span> 전화번호부로`;
        if(btn) btn.style.background = '#64748b'; // slate
        document.querySelector('.page-title').textContent = '전화번호부 휴지통';
    } else {
        if(btn) btn.innerHTML = `<span class="material-icons" style="font-size: 1.1rem;">delete_outline</span> 휴지통`;
        if(btn) btn.style.background = '#ef4444'; // red
        document.querySelector('.page-title').textContent = '전화번호부';
    }
    
    fetchMembers();
};

window.restorePhonebookMember = async function(id) {
    if(!confirm("이 수강생을 다시 복구하시겠습니까?")) return;
    const m = allMembers.find(m => String(m.id) === String(id));
    if(m) {
        m.status = 'registered';
        try {
            await fetch(getFetchUrl('members', true), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(m)
            });
            fetchMembers();
        } catch(e) {
            console.error(e);
        }
    }
};

window.deletePermanentPhonebook = async function(id) {
    if(!confirm("이 수강생을 완전히 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;
    try {
        await fetch(getFetchUrl(`members?id=${id}`, true), { method: 'DELETE' });
        fetchMembers();
    } catch(e) {
        console.error(e);
        alert('삭제 실패');
    }
};
