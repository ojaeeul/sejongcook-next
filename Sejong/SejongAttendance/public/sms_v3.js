const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:8000/api' : '/api/sejong';

let allMembers = [];
let selectedTargets = []; // Array of member objects
let currentMsgType = 'SMS';
let editingTemplateIndex = -1;
let isAddingNewTemplate = false;

let defaultTemplates = [
    { text: '반갑습니다.', type: 'SMS' },
    { text: '[세종요리제과학원] 안녕하세요! %%% 학생 오늘 수업 안내드립니다.', type: 'SMS' },
    { text: '[세종요리제과학원] 안녕하세요! %%% 학생, 이번 주 수업 일정 및 학원 안내입니다. 항상 저희 학원을 이용해 주셔서 진심으로 감사드리며 편안한 하루 되시길 바랍니다.', type: 'LMS' }
];

let storedTemplates = localStorage.getItem('sejongSmsTemplates');
let parsed = storedTemplates ? JSON.parse(storedTemplates) : defaultTemplates;

// Convert any legacy string templates into objects
let myTemplates = parsed.map(t => {
    if (typeof t === 'string') {
        let bytes = 0;
        for (let j = 0; j < t.length; j++) bytes += t.charCodeAt(j) > 128 ? 2 : 1;
        return { text: t, type: bytes > 90 ? 'LMS' : 'SMS' };
    }
    return t;
});
localStorage.setItem('sejongSmsTemplates', JSON.stringify(myTemplates));

document.addEventListener('DOMContentLoaded', () => {
    fetchMembers();
    renderTemplates(); // Initialize templates
    filterTemplates(); // Apply filter initially

    // Event listeners
    document.querySelectorAll('input[name="targetType"]').forEach(radio => {
        radio.addEventListener('change', renderTargetList);
    });
    document.getElementById('includeInactive').addEventListener('change', renderTargetList);
});

// Custom Modal Helpers
function openModal(title, bodyHTML, onConfirm = null, confirmBtnText = '확인', confirmBtnColor = '#3b82f6') {
    const modalTitle = document.getElementById('smsModalTitle');
    const modalBody = document.getElementById('smsModalBody');
    const modal = document.getElementById('smsModal');
    let confirmBtn = document.querySelector('.modal-btn-confirm');
    let cancelBtn = document.querySelector('.modal-btn-cancel');

    if (!modal) return;

    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHTML;

    // Reset event listeners by cloning
    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    const closeFn = () => { modal.style.display = 'none'; };

    if (onConfirm) {
        newConfirmBtn.style.display = 'block';
        newConfirmBtn.textContent = confirmBtnText;
        newConfirmBtn.style.background = confirmBtnColor;
        newConfirmBtn.onclick = () => { closeFn(); onConfirm(); };

        newCancelBtn.textContent = '취소';
        newCancelBtn.style.background = '#e2e8f0';
        newCancelBtn.style.color = '#475569';
        newCancelBtn.onclick = closeFn;
    } else {
        newConfirmBtn.style.display = 'none';
        newCancelBtn.textContent = '확인';
        newCancelBtn.style.background = '#3b82f6';
        newCancelBtn.style.color = 'white';
        newCancelBtn.onclick = closeFn;
    }

    modal.style.display = 'flex';
}

function showModalAlert(msg, isError = false) {
    const title = isError ? '오류' : '알림';
    const content = isError
        ? `<div style="text-align:center; padding: 30px 0; font-size:1.1rem; color:#ef4444; font-weight:700; display:flex; flex-direction:column; align-items:center; gap:10px;"><i class="material-icons" style="font-size:3rem;">error_outline</i>${msg}</div>`
        : `<div style="text-align:center; padding: 30px 0; font-size:1.05rem; color:#334155;">${msg}</div>`;
    openModal(title, content, null);
}

function showModalConfirm(msg, onConfirm) {
    const content = `<div style="text-align:center; padding: 30px 0; font-size:1.1rem; color:#334155; font-weight:500;">${msg}</div>`;
    openModal('확인', content, onConfirm);
}

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
        showModalAlert('전화번호가 없습니다.', true);
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

    items.forEach((item, index) => {
        const tmpl = myTemplates[index];
        if (!tmpl) return;
        const text = tmpl.text.toLowerCase();
        const typeBadge = tmpl.type.toLowerCase();

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

    if (isAddingNewTemplate) {
        const div = document.createElement('div');
        div.className = 'template-item-new';
        div.style.background = '#e0f2fe';
        div.style.padding = '8px 10px';
        div.style.border = '1px solid #3b82f6';
        div.style.marginBottom = '10px';

        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                <div style="font-weight:700; font-size:0.85rem; color:#1e3a8a;">새 템플릿 등록</div>
                <select id="newTplType" style="padding:2px 5px; font-size:0.8rem; border-color:#93c5fd; border-radius:4px; outline:none;" onclick="event.stopPropagation()">
                    <option value="SMS" ${currentTab === 'lms' ? '' : 'selected'}>SMS (단문설정)</option>
                    <option value="LMS" ${currentTab === 'lms' ? 'selected' : ''}>LMS (장문설정)</option>
                </select>
            </div>
            <div style="display:flex; flex-direction:column; width:100%; gap:5px;">
                <textarea id="newTplInput" placeholder="여기에 내용을 입력하세요..." style="width:100%; height:80px; padding:8px; font-size:0.85rem; border:1px solid #93c5fd; border-radius:4px; resize:none;" onclick="event.stopPropagation()"></textarea>
                <div style="display:flex; justify-content:flex-end; gap:5px;">
                    <button onclick="event.stopPropagation(); confirmNewTemplate()" style="padding:4px 10px; background:#10b981; color:white; border:none; border-radius:3px; cursor:pointer;">저장</button>
                    <button onclick="event.stopPropagation(); cancelNewTemplate()" style="padding:4px 10px; background:#94a3b8; color:white; border:none; border-radius:3px; cursor:pointer;">취소</button>
                </div>
            </div>
        `;
        box.appendChild(div);
    }

    myTemplates.forEach((tmpl, i) => {
        const text = tmpl.text;
        const type = tmpl.type;
        const color = type === 'LMS' ? '#ef4444' : '#3b82f6';
        let shortText = text.replace(/\\n/g, ' ');
        if (shortText.length > 25) shortText = shortText.substring(0, 25) + '...';

        const div = document.createElement('div');
        div.className = 'template-item';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';

        if (editingTemplateIndex === i) {
            div.style.background = '#f8fafc';
            div.style.padding = '8px 10px';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <div style="font-weight:700; font-size:0.85rem; color:#475569;">템플릿 수정</div>
                    <select id="editTplType_${i}" style="padding:2px 5px; font-size:0.8rem; border-color:#cbd5e1; border-radius:4px; outline:none;" onclick="event.stopPropagation()">
                        <option value="SMS" ${type === 'SMS' ? 'selected' : ''}>SMS 설정</option>
                        <option value="LMS" ${type === 'LMS' ? 'selected' : ''}>LMS 설정</option>
                    </select>
                </div>
                <div style="display:flex; flex-direction:column; width:100%; gap:5px;">
                    <textarea id="editTpl_${i}" style="width:100%; height:80px; padding:8px; font-size:0.85rem; border:1px solid #3b82f6; border-radius:4px; resize:none;" onclick="event.stopPropagation()">${text}</textarea>
                    <div style="display:flex; justify-content:flex-end; gap:5px;">
                        <button onclick="event.stopPropagation(); saveEditTemplate(${i})" style="padding:4px 10px; background:#10b981; color:white; border:none; border-radius:3px; cursor:pointer;">저장</button>
                        <button onclick="event.stopPropagation(); cancelEditTemplate()" style="padding:4px 10px; background:#94a3b8; color:white; border:none; border-radius:3px; cursor:pointer;">취소</button>
                    </div>
                </div>
            `;
        } else {
            div.innerHTML = `
                <div style="cursor:pointer; flex:1; padding-left: 5px;" onclick="loadTemplateByIndex(${i})">
                    <span class="type-badge" style="color:${color}; border-color:${color};">${type}</span> 
                    ${shortText}
                </div>
                <div style="display:flex; gap:8px;">
                    <i class="material-icons" style="font-size:1.1rem; color:#94a3b8; cursor:pointer;" title="수정" onclick="editTemplateInline(${i})">edit</i>
                    <i class="material-icons" style="font-size:1.1rem; color:#cbd5e1; cursor:pointer;" title="삭제" onclick="deleteTemplate(${i}, event)">close</i>
                </div>
            `;
        }

        box.appendChild(div);
    });
    filterTemplates();
}

function loadTemplateByIndex(i) {
    if (editingTemplateIndex !== -1) return; // Prevent loading while editing
    document.getElementById('messageInput').value = myTemplates[i].text;
    updateMockup();
}

function editTemplateInline(i, e) {
    if (e) e.stopPropagation();
    editingTemplateIndex = i;
    renderTemplates();
}

function saveEditTemplate(i) {
    const editArea = document.getElementById(`editTpl_${i}`);
    const typeSelect = document.getElementById(`editTplType_${i}`);
    if (!editArea) return;
    const newText = editArea.value.trim();
    if (!newText) {
        showModalAlert('내용을 입력해주세요.', true);
        return;
    }
    const newType = typeSelect ? typeSelect.value : myTemplates[i].type;

    myTemplates[i] = { text: newText, type: newType };
    localStorage.setItem('sejongSmsTemplates', JSON.stringify(myTemplates));
    editingTemplateIndex = -1;

    // MUST call renderTemplates BEFORE switchTab so DOM updates and hides the editor
    renderTemplates();

    if (currentTab !== 'all' && currentTab !== newType.toLowerCase()) {
        switchTab(newType.toLowerCase());
    }

    loadTemplateByIndex(i);
    showModalAlert('수정되었습니다.');
}

function cancelEditTemplate() {
    editingTemplateIndex = -1;
    renderTemplates();
}

function deleteTemplate(i, e) {
    e.stopPropagation();
    showModalConfirm('이 템플릿을 삭제하시겠습니까?', () => {
        myTemplates.splice(i, 1);
        localStorage.setItem('sejongSmsTemplates', JSON.stringify(myTemplates));
        renderTemplates();
    });
}

function openNewTemplateEditor() {
    isAddingNewTemplate = true;
    editingTemplateIndex = -1; // close any open edit
    renderTemplates();

    // Focus the new input
    setTimeout(() => {
        const input = document.getElementById('newTplInput');
        if (input) input.focus();
    }, 50);
}

function confirmNewTemplate() {
    const input = document.getElementById('newTplInput');
    const typeSelect = document.getElementById('newTplType');
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
        showModalAlert('등록할 내용을 입력해주세요.', true);
        return;
    }
    if (myTemplates.some(t => t.text === text)) {
        showModalAlert('이미 동일한 내용의 템플릿이 있습니다.', true);
        return;
    }

    const type = typeSelect ? typeSelect.value : 'SMS';
    myTemplates.unshift({ text, type }); // Add to top
    localStorage.setItem('sejongSmsTemplates', JSON.stringify(myTemplates));
    isAddingNewTemplate = false;

    // MUST render DOM to destroy editor before tab switch logic
    renderTemplates();

    if (currentTab !== 'all' && currentTab !== type.toLowerCase()) {
        switchTab(type.toLowerCase());
    }

    showModalAlert('새로운 템플릿이 등록되었습니다.');
}

function cancelNewTemplate() {
    isAddingNewTemplate = false;
    renderTemplates();
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
        showModalAlert('전송 대상을 먼저 추가해주세요.', true);
        return;
    }
    let text = document.getElementById('messageInput').value;
    const useFooter = document.getElementById('useFooter').checked;
    const footerInput = document.getElementById('footerInput').value;

    if (useFooter && footerInput.trim() !== '') {
        if (text.trim() === '') {
            text = footerInput;
        } else {
            text += '\\n\\n' + footerInput;
        }
    }

    if (text.trim() === '') {
        showModalAlert('메시지 내용을 입력해주세요.', true);
        return;
    }

    // Build personalized examples
    let personalizedMessages = [];
    selectedTargets.forEach(t => {
        let msg = text.replace(/%%%/g, t.name);

        // If tuition date logic is requested (assuming t.reg_date or similar holds billing date)
        const tuitionDate = t.reg_date ? new Date(t.reg_date).getDate() + '일' : '지정일';
        msg = msg.replace(/@@@/g, tuitionDate);

        personalizedMessages.push(`[${t.name}님] : ${msg.substring(0, 20)}...`);
    });

    const previewOutput = personalizedMessages.slice(0, 3).map(msg => `<div style="background:#f1f5f9; padding:10px; border-radius:6px; margin-bottom:8px; font-size:0.9rem;">${msg.replace(/\\n/g, '<br>')}</div>`).join('');
    const extraCount = personalizedMessages.length > 3 ? `<div style="text-align:center; color:#64748b; font-size:0.85rem; margin-top:5px;">...외 ${personalizedMessages.length - 3}명</div>` : '';

    const title = `[${currentMsgType}] 전송 확인`;

    const bodyHTML = `
        <div style="margin-bottom:15px;">
            <strong style="color:#2563eb; font-size:1.1rem;">총 ${selectedTargets.length}명</strong>에게 문자를 발송합니다.
        </div>
        <div style="font-weight:700; margin-bottom:8px; color:#475569; border-bottom:2px solid #e2e8f0; padding-bottom:5px;">전송 내용 미리보기 (최대 3건)</div>
        ${previewOutput}
        ${extraCount}
        <div style="margin-top:20px; font-weight:700; color:#ef4444; text-align:center;">
            발송하시겠습니까?
        </div>
    `;

    openModal(title, bodyHTML, confirmSmsSend, '발송하기', '#3b82f6');
}

function confirmSmsSend() {
    showModalAlert('전송이 완료되었습니다. (테스트용 응답입니다)');
}
