const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000/api' : '/api/sejong';

let allMembers = [];
let groupedCourses = {};
let selectedTargets = []; // Array of member objects
let currentMsgType = 'SMS';
let selectedTemplateIndex = -1;

let myTemplates = JSON.parse(localStorage.getItem('sejongSmsTemplates')) || [
    '반갑습니다.',
    '[세종요리제과학원] 안녕하세요! %%% 학생 오늘 수업 안내드립니다.'
];

document.addEventListener('DOMContentLoaded', () => {
    fetchMembers();
    renderTemplates(); // Initialize templates

    // Event listeners
    document.querySelectorAll('input[name="targetType"]').forEach(radio => {
        radio.addEventListener('change', renderTargetList);
    });
    document.getElementById('includeInactive').addEventListener('change', renderTargetList);
});

async function fetchMembers() {
    try {
        const res = await fetch(`${API_BASE}/members`);
        allMembers = await res.json();
        processCourses();
        renderTargetList();
    } catch (err) {
        console.error('Failed to fetch members for SMS:', err);
    }
}

function processCourses() {
    groupedCourses = { '미지정': [] };
    allMembers.forEach(m => {
        if (!m.course || m.course.trim() === '') {
            groupedCourses['미지정'].push(m);
        } else {
            m.course.split(',').forEach(c => {
                const cName = c.trim();
                if (!groupedCourses[cName]) groupedCourses[cName] = [];
                groupedCourses[cName].push(m);
            });
        }
    });
}

let expandedCourses = new Set();

function renderTargetList() {
    const includeInactive = document.getElementById('includeInactive').checked;
    const targetType = document.querySelector('input[name="targetType"]:checked').value;

    const listDiv = document.getElementById('courseList');
    listDiv.innerHTML = '';

    Object.keys(groupedCourses).sort().forEach(cName => {
        let membersInCourse = groupedCourses[cName];

        // Filter active/inactive
        if (!includeInactive) {
            membersInCourse = membersInCourse.filter(m => m.status !== 'trash' && m.status !== 'delete');
        }

        // Filter by phone existence based on type
        membersInCourse = membersInCourse.filter(m => {
            return targetType === 'student' ? m.phone : m.phone_guardian;
        });

        if (membersInCourse.length === 0) return;

        const groupDiv = document.createElement('div');

        // Header
        const header = document.createElement('div');
        header.className = 'course-item';
        const isExpanded = expandedCourses.has(cName);
        header.innerHTML = `
            <span><i class="material-icons" style="font-size:1rem; vertical-align:middle; margin-right:5px; color:#cbd5e1;">folder</i> ${cName} <span style="font-size:0.8rem; color:#94a3b8;">(${membersInCourse.length})</span></span>
            <i class="material-icons">${isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}</i>
        `;

        // Member list
        const membersDiv = document.createElement('div');
        membersDiv.style.display = isExpanded ? 'block' : 'none';
        membersDiv.style.background = '#f8fafc';
        membersDiv.style.padding = '5px 0';

        membersInCourse.forEach(m => {
            const mDiv = document.createElement('div');
            mDiv.className = 'member-row';
            const phone = targetType === 'student' ? m.phone : m.phone_guardian;
            mDiv.dataset.id = m.id;
            mDiv.dataset.phone = phone || '';

            mDiv.style.padding = '8px 20px 8px 40px';
            mDiv.style.fontSize = '0.9rem';
            mDiv.style.cursor = 'pointer';
            mDiv.style.display = 'flex';
            mDiv.style.justifyContent = 'space-between';
            mDiv.style.borderBottom = '1px solid #f1f5f9';

            const isSelected = selectedTargets.some(t => t.id === m.id && t.phone === phone);
            if (isSelected) mDiv.style.color = '#3b82f6';

            mDiv.innerHTML = `
                <span>
                    <i class="material-icons" style="font-size:1rem; vertical-align:middle; margin-right:5px; color:${isSelected ? '#3b82f6' : '#cbd5e1'};">
                        ${isSelected ? 'check_circle' : 'radio_button_unchecked'}
                    </i>
                    ${m.name}
                </span>
                <span style="font-size:0.8rem; color:#94a3b8;">${phone || '-'}</span>
            `;

            mDiv.onclick = (e) => {
                e.stopPropagation();
                toggleTarget(m, phone, cName);
            };
            membersDiv.appendChild(mDiv);
        });

        header.onclick = () => {
            const isHidden = membersDiv.style.display === 'none';
            membersDiv.style.display = isHidden ? 'block' : 'none';
            header.querySelector('i:last-child').textContent = isHidden ? 'keyboard_arrow_up' : 'keyboard_arrow_down';
            if (isHidden) expandedCourses.add(cName);
            else expandedCourses.delete(cName);
        };

        groupDiv.appendChild(header);
        groupDiv.appendChild(membersDiv);
        listDiv.appendChild(groupDiv);
    });
}

function updateCheckmarks() {
    document.querySelectorAll('.member-row').forEach(mDiv => {
        const id = mDiv.dataset.id;
        const phone = mDiv.dataset.phone;
        const isSelected = selectedTargets.some(t => String(t.id) === id && String(t.phone) === phone);

        mDiv.style.color = isSelected ? '#3b82f6' : '';
        const iTag = mDiv.querySelector('i');
        if (iTag) {
            iTag.style.color = isSelected ? '#3b82f6' : '#cbd5e1';
            iTag.textContent = isSelected ? 'check_circle' : 'radio_button_unchecked';
        }
    });
}

function toggleTarget(member, phone, courseName) {
    if (!phone) {
        alert('전화번호가 없습니다.');
        return;
    }

    const index = selectedTargets.findIndex(t => t.id === member.id && t.phone === phone);
    if (index > -1) {
        selectedTargets.splice(index, 1);
    } else {
        selectedTargets.push({ ...member, phone: phone, selectedCourse: courseName });
    }

    updateCheckmarks();
    updateSelectedTags();
}

function updateSelectedTags() {
    const tagsDiv = document.getElementById('targetTags');
    const countSpan = document.getElementById('targetCount');

    tagsDiv.innerHTML = '';
    countSpan.textContent = `${selectedTargets.length}명 / 발송예정 건수: ${selectedTargets.length}`;

    selectedTargets.forEach((t, index) => {
        const tag = document.createElement('div');
        tag.className = 'target-tag';
        tag.innerHTML = `
            ${t.name}
            <i class="material-icons" onclick="removeTarget(${index})">cancel</i>
        `;
        tagsDiv.appendChild(tag);
    });
}

function removeTarget(index) {
    selectedTargets.splice(index, 1);
    updateCheckmarks();
    updateSelectedTags();
}

function selectAllCourses() {
    const includeInactive = document.getElementById('includeInactive').checked;
    const targetType = document.querySelector('input[name="targetType"]:checked').value;

    Object.keys(groupedCourses).forEach(cName => {
        let membersInCourse = groupedCourses[cName];
        if (!includeInactive) {
            membersInCourse = membersInCourse.filter(m => m.status !== 'trash' && m.status !== 'delete');
        }
        membersInCourse.forEach(m => {
            const phone = targetType === 'student' ? m.phone : m.phone_guardian;
            if (phone) {
                const alreadySelected = selectedTargets.some(t => t.id === m.id && t.phone === phone);
                if (!alreadySelected) {
                    selectedTargets.push({ ...m, phone: phone, selectedCourse: cName });
                }
            }
        });
    });

    updateCheckmarks();
    updateSelectedTags();
}

function deselectAllCourses() {
    selectedTargets = [];
    updateCheckmarks();
    updateSelectedTags();
}

// ----------------------------------------------------
// Right Panel Logic (Mockup & Editor)
// ----------------------------------------------------

let currentTab = 'all';

function switchTab(type) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(b => {
        if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(`switchTab('${type}')`)) {
            b.classList.add('active');
            b.style.background = '#3b82f6';
            b.style.color = 'white';
            b.style.fontWeight = 'bold';
        } else {
            b.classList.remove('active');
            b.style.background = 'white';
            b.style.color = '#3b82f6';
            b.style.fontWeight = 'normal';
        }
    });

    currentTab = type;
    filterTemplates();
}

function filterTemplates() {
    const searchInput = document.getElementById('searchTemplateInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const items = document.querySelectorAll('.template-item');

    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        const badgeEl = item.querySelector('.type-badge');
        const typeBadge = badgeEl ? badgeEl.textContent.toLowerCase() : '';

        let matchesTab = true;
        if (currentTab === 'sms' && typeBadge !== 'sms') matchesTab = false;
        if (currentTab === 'lms' && typeBadge !== 'lms') matchesTab = false;

        let matchesSearch = text.includes(searchTerm);

        if (matchesTab && matchesSearch) {
            item.style.display = 'flex'; // Use flex since the new items are flex containers
        } else {
            item.style.display = 'none';
        }
    });
}

function loadLocalFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        document.getElementById('messageInput').value = content;
        updateMockup();
        // Reset input so the same file can be picked again if needed
        event.target.value = '';
    };
    reader.readAsText(file);
}

function renderTemplates() {
    const box = document.getElementById('templateBox');
    if (!box) return;
    box.innerHTML = '';

    myTemplates.forEach((text, i) => {
        let bytes = 0;
        for (let j = 0; j < text.length; j++) bytes += text.charCodeAt(j) > 128 ? 2 : 1;

        const type = bytes > 90 ? 'LMS' : 'SMS';
        const color = type === 'LMS' ? '#ef4444' : '#3b82f6';
        let shortText = text.replace(/\n/g, ' ');
        if (shortText.length > 25) shortText = shortText.substring(0, 25) + '...';

        const div = document.createElement('div');
        div.className = 'template-item';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        if (selectedTemplateIndex === i) {
            div.style.background = '#eff6ff';
            div.style.fontWeight = '700';
            div.style.borderLeft = '3px solid #3b82f6';
        }

        div.innerHTML = `
            <div style="cursor:pointer; flex:1; padding-left: ${selectedTemplateIndex === i ? '5px' : '8px'};" onclick="loadTemplateByIndex(${i})">
                <span class="type-badge" style="color:${color}; border-color:${color};">${type}</span> 
                ${shortText}
            </div>
            <i class="material-icons" style="font-size:1.1rem; color:#cbd5e1; cursor:pointer;" title="삭제" onclick="deleteTemplate(${i}, event)">close</i>
        `;
        box.appendChild(div);
    });
    filterTemplates();
}

function loadTemplateByIndex(i) {
    selectedTemplateIndex = i;
    document.getElementById('messageInput').value = myTemplates[i];
    updateMockup();
    renderTemplates();
}

function deleteTemplate(i, e) {
    e.stopPropagation();
    if (confirm('이 템플릿을 삭제하시겠습니까?')) {
        myTemplates.splice(i, 1);
        localStorage.setItem('sejongSmsTemplates', JSON.stringify(myTemplates));
        renderTemplates();
    }
}

function saveNewTemplate() {
    const text = document.getElementById('messageInput').value.trim();
    if (!text) {
        alert('등록할 내용을 아래 입력창에 작성해주세요.');
        return;
    }
    if (myTemplates.includes(text)) {
        alert('이미 동일한 내용의 템플릿이 있습니다.');
        return;
    }
    myTemplates.unshift(text); // Add to top
    selectedTemplateIndex = 0;
    localStorage.setItem('sejongSmsTemplates', JSON.stringify(myTemplates));
    renderTemplates();
    alert('새로운 자동글이 등록되었습니다.');
}

function updateSelectedTemplate() {
    if (selectedTemplateIndex === -1) {
        alert('수정할 항목을 위 목록에서 먼저 선택(클릭)해주세요.');
        return;
    }
    const text = document.getElementById('messageInput').value.trim();
    if (!text) {
        alert('내용을 입력해주세요.');
        return;
    }
    if (confirm('선택한 자동글(템플릿)의 내용을 현재 작성된 내용으로 덮어쓰시겠습니까?')) {
        myTemplates[selectedTemplateIndex] = text;
        localStorage.setItem('sejongSmsTemplates', JSON.stringify(myTemplates));
        renderTemplates();
        alert('수정되었습니다.');
    }
}

function loadTemplate(text) {
    document.getElementById('messageInput').value = text;
    updateMockup();
}

function updateMockup() {
    let text = document.getElementById('messageInput').value;
    const useFooter = document.getElementById('useFooter').checked;
    const footerInput = document.getElementById('footerInput').value;

    if (useFooter && footerInput.trim() !== '') {
        if (text.trim() === '') {
            text = footerInput;
        } else {
            text += '\n\n' + footerInput;
        }
    }

    const bubble = document.getElementById('mockupBubble');
    const topBar = document.getElementById('mockupTypeBar');

    // Replace %%% with a sample name for preview
    let previewText = text.replace(/%%%/g, '김학생');

    if (previewText.trim() === '') {
        bubble.textContent = '메시지를 입력해주세요...';
        bubble.style.color = '#94a3b8';
    } else {
        bubble.textContent = previewText;
        bubble.style.color = '#334155';
    }

    // Rough byte calculation (Korean = 2 bytes, English = 1 byte)
    let bytes = 0;
    for (let i = 0; i < text.length; i++) {
        bytes += text.charCodeAt(i) > 128 ? 2 : 1;
    }

    if (bytes > 90) {
        currentMsgType = 'LMS';
        topBar.textContent = `LMS ${bytes} bytes`;
        topBar.style.background = '#ef4444'; // Red for LMS
    } else {
        currentMsgType = 'SMS';
        topBar.textContent = `SMS ${bytes} bytes`;
        topBar.style.background = '#3b82f6'; // Blue for SMS
    }
}

function sendSms() {
    if (selectedTargets.length === 0) {
        alert('전송 대상을 선택해주세요.');
        return;
    }
    let text = document.getElementById('messageInput').value;
    const useFooter = document.getElementById('useFooter').checked;
    const footerInput = document.getElementById('footerInput').value;

    if (useFooter && footerInput.trim() !== '') {
        if (text.trim() === '') {
            text = footerInput;
        } else {
            text += '\n\n' + footerInput;
        }
    }

    if (text.trim() === '') {
        alert('메시지 내용을 입력해주세요.');
        return;
    }

    // Implementation for actual API call goes here
    alert(`[${currentMsgType}] ${selectedTargets.length}명에게 전송을 요청합니다.\\n\\n내용:\\n${text}`);
}
