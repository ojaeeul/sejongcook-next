const EXPENSE_API_URL = '/api/sejong/sejong_expense';

// 과정 분류
const COOKING_COURSES = ['한식기능사', '양식기능사', '일식기능사', '중식기능사', '복어기능사', '산업기사', '가정요리', '브런치', '피자', '분식', '원데이클래스'];
const BAKING_COURSES = ['제과기능사', '제빵기능사', '제과제빵기능사', '원데이', '케익디자이너'];

let paymentsData = [];
let membersData = [];

document.addEventListener('DOMContentLoaded', async () => {
    initCardPopup();
    await loadNotebookData();
    await fetchTuitionData();
    processNewPayments();
    
    // 이벤트 리스너 등록 (이벤트 위임 사용)
    const notebook = document.querySelector('.notebook');
    notebook.addEventListener('input', handleInput);
    notebook.addEventListener('click', handleClick);
    
    // 초기 내용물이 비어있으면 기본 30줄 생성
    ensureMinimumLines();
});

// 수동 데이터 로드
async function loadNotebookData() {
    try {
        const res = await fetch(EXPENSE_API_URL + '?t=' + Date.now());
        const data = await res.json();
        
        if (data && data.leftHTML) {
            document.getElementById('expense-container').innerHTML = data.leftHTML;
        }
        if (data && data.cookingHTML) {
            document.getElementById('sales-cooking-container').innerHTML = data.cookingHTML;
        }
        if (data && data.bakingHTML) {
            document.getElementById('sales-baking-container').innerHTML = data.bakingHTML;
        }
    } catch (e) {
        console.error("Failed to load notebook data:", e);
    }
    
    // 강제 contenteditable 적용
    document.querySelectorAll('.date-col, .desc-col, .amount-col').forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'false');
    });
}

// 자동 저장 (Debounce)
let saveTimeout;
function triggerAutoSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveNotebookData, 1500);
}

async function saveNotebookData() {
    const leftHTML = document.getElementById('expense-container').innerHTML;
    const cookingHTML = document.getElementById('sales-cooking-container').innerHTML;
    const bakingHTML = document.getElementById('sales-baking-container').innerHTML;
    
    const payload = {
        id: "notebook_state",
        leftHTML,
        cookingHTML,
        bakingHTML,
        updatedAt: new Date().toISOString()
    };
    
    try {
        await fetch(EXPENSE_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        console.log("Notebook auto-saved");
    } catch (e) {
        console.error("Failed to save notebook:", e);
    }
}

// 수강료 데이터 로드
async function fetchTuitionData() {
    try {
        const pRes = await fetch('/api/sejong/sejong_payments?t=' + Date.now());
        paymentsData = await pRes.json();
        
        const mRes = await fetch('/api/sejong/sejong_members?t=' + Date.now());
        membersData = await mRes.json();
    } catch (e) {
        console.error("Failed to fetch tuition data:", e);
    }
}

// 새로운 결제 내역 자동 반영
function processNewPayments() {
    if (!Array.isArray(paymentsData)) return;
    
    let hasChanges = false;
    
    // paid 인 결제만 필터링, updatedAt 기준 오름차순 정렬
    const paidPayments = paymentsData
        .filter(p => p.status === 'paid')
        .sort((a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0));
        
    paidPayments.forEach(p => {
        // 이미 DOM에 있는지 확인
        if (document.querySelector(`[data-payment-id="${p.memberId}_${p.year}_${p.month}"]`)) {
            return;
        }
        
        const member = membersData.find(m => String(m.id) === String(p.memberId));
        const memberName = member ? member.name : '알수없음';
        const courseName = p.course || (member ? member.course : '');
        
        const amountStr = Number(p.amount || 0).toLocaleString() + ' (카)';
        const dateObj = p.updatedAt ? new Date(p.updatedAt) : new Date();
        const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}(${['일','월','화','수','목','금','토'][dateObj.getDay()]})`;
        
        // 과정 분류에 따라 타겟 컨테이너 결정
        let targetContainerId = 'sales-cooking-container'; // 기본값 (요리)
        if (BAKING_COURSES.some(bc => courseName.includes(bc))) {
            targetContainerId = 'sales-baking-container';
        }
        
        const container = document.getElementById(targetContainerId);
        
        // 날짜가 처음 등장하는지 확인
        const existingDates = Array.from(container.querySelectorAll('.date-col')).map(el => el.textContent.trim());
        const isFirstOfDay = !existingDates.includes(dateStr);
        
        // 첫 데이터면 2줄 띄우기
        if (isFirstOfDay && container.children.length > 0) {
            container.insertAdjacentHTML('beforeend', `<div class="entry-line"><div class="date-col"></div><div class="desc-col"></div><div class="amount-col"></div></div>`);
            container.insertAdjacentHTML('beforeend', `<div class="entry-line"><div class="date-col"></div><div class="desc-col"></div><div class="amount-col"></div></div>`);
        }
        
        // 항목 추가
        const newLine = document.createElement('div');
        newLine.className = 'entry-line tuition-auto';
        newLine.setAttribute('data-payment-id', `${p.memberId}_${p.year}_${p.month}`);
        
        // 이름 뒤에 과정명 표기? 요청에 의하면 "예: 이름, 수강비". 과정명도 살짝 넣으면 좋음
        const shortCourse = courseName ? courseName.split('(')[0] : '';
        
        newLine.innerHTML = `
            <div class="date-col" contenteditable="true">${isFirstOfDay ? dateStr : ''}</div>
            <div class="desc-col" contenteditable="true">${memberName} ${shortCourse ? '('+shortCourse+')' : ''}</div>
            <div class="amount-col" contenteditable="true">${amountStr}</div>
        `;
        
        container.appendChild(newLine);
        hasChanges = true;
    });
    
    if (hasChanges) {
        ensureMinimumLines();
        saveNotebookData();
    }
}

// 자동 날짜 입력 등 입력 감지
function handleInput(e) {
    const target = e.target;
    
    // desc-col에 내용이 입력되었을 때
    if (target.classList.contains('desc-col')) {
        const text = target.textContent.trim();
        const line = target.closest('.entry-line');
        const dateCol = line.querySelector('.date-col');
        
        if (text.length > 0 && dateCol && dateCol.textContent.trim() === '') {
            const now = new Date();
            const days = ['일', '월', '화', '수', '목', '금', '토'];
            dateCol.textContent = `${now.getMonth() + 1}/${now.getDate()}(${days[now.getDay()]})`;
        }
    }
    
    triggerAutoSave();
}

// 카드 팝업 상태
let activeAmountCol = null;

function handleClick(e) {
    const target = e.target;
    
    // (카) 글자 또는 amount-col 클릭 시
    if (target.classList.contains('amount-col') || (target.textContent && target.textContent.includes('(카)'))) {
        const amountCol = target.classList.contains('amount-col') ? target : target.closest('.amount-col');
        if (amountCol) {
            showCardPopup(amountCol, e.clientX, e.clientY);
        }
    } else {
        hideCardPopup();
    }
}

function initCardPopup() {
    const html = `
        <div id="card-selector-popup" class="hidden">
            <button onclick="selectCardOption('(카)')">(카)</button>
            <button onclick="selectCardOption('(ok)')">(ok)</button>
            <button onclick="selectCardOption('(김포)')">(김포)</button>
            <button onclick="selectCardOption('(국)')">(국)</button>
            <button onclick="selectCardOption('(신)')">(신)</button>
            <button onclick="selectCardOption('(농)')">(농)</button>
            <button onclick="selectCardOption('(현)')">(현)</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    
    const style = document.createElement('style');
    style.textContent = `
        #card-selector-popup {
            position: fixed;
            background: white;
            border: 1px solid #ccc;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-radius: 8px;
            padding: 8px;
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            width: 200px;
            z-index: 10000;
        }
        #card-selector-popup.hidden {
            display: none;
        }
        #card-selector-popup button {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        #card-selector-popup button:hover {
            background: #e2e8f0;
        }
    `;
    document.head.appendChild(style);
}

function showCardPopup(amountColEl, x, y) {
    activeAmountCol = amountColEl;
    const popup = document.getElementById('card-selector-popup');
    popup.classList.remove('hidden');
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
}

function hideCardPopup() {
    const popup = document.getElementById('card-selector-popup');
    if (popup) popup.classList.add('hidden');
}

window.selectCardOption = function(optionText) {
    if (activeAmountCol) {
        let text = activeAmountCol.textContent;
        // 기존 괄호 내용(예: (카), (NC) 등)을 찾아서 대체, 없으면 뒤에 추가
        if (text.match(/\\([^)]+\\)/)) {
            text = text.replace(/\\([^)]+\\)$/, optionText);
        } else {
            text = text + ' ' + optionText;
        }
        activeAmountCol.textContent = text;
        hideCardPopup();
        triggerAutoSave();
    }
}

// 빈 줄이 부족하면 항상 유지하도록
function ensureMinimumLines() {
    const containers = [
        document.getElementById('expense-container'),
        document.getElementById('sales-cooking-container'),
        document.getElementById('sales-baking-container')
    ];
    
    containers.forEach(container => {
        if(!container) return;
        const emptyLines = Array.from(container.children).filter(line => line.textContent.trim() === '').length;
        if (emptyLines < 5) {
            for(let i=0; i<10; i++) {
                container.insertAdjacentHTML('beforeend', `
                    <div class="entry-line">
                        <div class="date-col" contenteditable="true"></div>
                        <div class="desc-col" contenteditable="true"></div>
                        <div class="amount-col" contenteditable="true"></div>
                    </div>
                `);
            }
        }
    });
}
