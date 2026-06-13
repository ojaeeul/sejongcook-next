const EXPENSE_API_URL = '/api/sejong/expense';

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
    
    migrateMethodCol();
    
    // 강제 contenteditable 적용
    document.querySelectorAll('.date-col, .desc-col, .amount-col, .method-col').forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.setAttribute('spellcheck', 'false');
    });
}

function migrateMethodCol() {
    document.querySelectorAll('.amount-col').forEach(col => {
        if (!col.nextElementSibling || !col.nextElementSibling.classList.contains('method-col')) {
            const methodCol = document.createElement('div');
            methodCol.className = 'method-col';
            methodCol.setAttribute('contenteditable', 'true');
            methodCol.setAttribute('spellcheck', 'false');
            
            let text = col.textContent;
            // (카) 등 패턴 추출하여 분리
            const match = text.match(/\s*(\([^)]+\))\s*$/);
            if (match) {
                methodCol.textContent = match[1];
                col.textContent = text.replace(match[0], '');
            }
            col.parentNode.insertBefore(methodCol, col.nextSibling);
        }
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
        const pRes = await fetch('/api/sejong/payments?t=' + Date.now());
        if (!pRes.ok) throw new Error('Payments fetch failed');
        paymentsData = await pRes.json();
        
        const mRes = await fetch('/api/sejong/members?t=' + Date.now());
        if (!mRes.ok) throw new Error('Members fetch failed');
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
        
    const cookingContainer = document.getElementById('sales-cooking-container');
    const bakingContainer = document.getElementById('sales-baking-container');
        
    paidPayments.forEach(p => {
        // 이미 DOM에 있는지 확인
        if (document.querySelector(`[data-payment-id="${p.memberId}_${p.year}_${p.month}"]`)) {
            return;
        }
        
        const member = membersData.find(m => String(m.id) === String(p.memberId));
        const memberName = member ? member.name : '알수없음';
        const courseName = p.course || (member ? member.course : '');
        
        const amountStr = Number(p.amount || 0).toLocaleString();
        const dateObj = p.updatedAt ? new Date(p.updatedAt) : new Date();
        const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}(${['일','월','화','수','목','금','토'][dateObj.getDay()]})`;
        
        const isBaking = BAKING_COURSES.some(bc => courseName.includes(bc));
        
        // 날짜 기준은 무조건 요리(왼쪽) 쪽
        const existingDates = Array.from(cookingContainer.querySelectorAll('.date-col')).map(el => el.textContent.trim());
        const isFirstOfDay = !existingDates.includes(dateStr);
        
        // 첫 데이터면 둘 다 2줄 띄우기
        if (isFirstOfDay && Math.max(cookingContainer.children.length, bakingContainer.children.length) > 0) {
            for(let i=0; i<2; i++) {
                cookingContainer.insertAdjacentHTML('beforeend', `<div class="entry-line"><div class="date-col" contenteditable="true"></div><div class="desc-col" contenteditable="true"></div><div class="amount-col" contenteditable="true"></div><div class="method-col" contenteditable="true"></div></div>`);
                bakingContainer.insertAdjacentHTML('beforeend', `<div class="entry-line"><div class="desc-col" contenteditable="true"></div><div class="amount-col" contenteditable="true"></div><div class="method-col" contenteditable="true"></div></div>`);
            }
        }
        
        const shortCourse = courseName ? courseName.split('(')[0] : '';
        const descHtml = `${memberName} ${shortCourse ? '('+shortCourse+')' : ''}`;
        
        const cookLine = document.createElement('div');
        cookLine.className = 'entry-line';
        const bakeLine = document.createElement('div');
        bakeLine.className = 'entry-line';
        
        if (isBaking) {
            bakeLine.className += ' tuition-auto';
            bakeLine.setAttribute('data-payment-id', `${p.memberId}_${p.year}_${p.month}`);
            cookLine.innerHTML = `
                <div class="date-col" contenteditable="true">${isFirstOfDay ? dateStr : ''}</div>
                <div class="desc-col" contenteditable="true"></div>
                <div class="amount-col" contenteditable="true"></div>
                <div class="method-col" contenteditable="true"></div>
            `;
            bakeLine.innerHTML = `
                <div class="desc-col" contenteditable="true">${descHtml}</div>
                <div class="amount-col" contenteditable="true">${amountStr}</div>
                <div class="method-col" contenteditable="true">(카)</div>
            `;
        } else {
            cookLine.className += ' tuition-auto';
            cookLine.setAttribute('data-payment-id', `${p.memberId}_${p.year}_${p.month}`);
            cookLine.innerHTML = `
                <div class="date-col" contenteditable="true">${isFirstOfDay ? dateStr : ''}</div>
                <div class="desc-col" contenteditable="true">${descHtml}</div>
                <div class="amount-col" contenteditable="true">${amountStr}</div>
                <div class="method-col" contenteditable="true">(카)</div>
            `;
            bakeLine.innerHTML = `
                <div class="desc-col" contenteditable="true"></div>
                <div class="amount-col" contenteditable="true"></div>
                <div class="method-col" contenteditable="true"></div>
            `;
        }
        
        cookingContainer.appendChild(cookLine);
        bakingContainer.appendChild(bakeLine);
        
        hasChanges = true;
    });
    
    // 취소된 항목(unpaid로 변경된 항목) 제거 로직
    const existingAutoItems = Array.from(document.querySelectorAll('[data-payment-id]'));
    existingAutoItems.forEach(el => {
        const pId = el.getAttribute('data-payment-id');
        const stillPaid = paidPayments.some(p => `${p.memberId}_${p.year}_${p.month}` === pId);
        
        if (!stillPaid) {
            const container = el.closest('.right-col-half');
            if (container) {
                const index = Array.from(container.children).indexOf(el);
                const otherContainerId = container.id === 'sales-cooking-container' ? 'sales-baking-container' : 'sales-cooking-container';
                const otherContainer = document.getElementById(otherContainerId);
                
                if (otherContainer && otherContainer.children[index]) {
                    otherContainer.removeChild(otherContainer.children[index]);
                }
                container.removeChild(el);
                hasChanges = true;
            }
        }
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
        const container = line.closest('.right-col-half') || line.closest('#expense-container');
        
        if (text.length > 0) {
            let targetDateCol = null;
            
            if (container && container.id === 'sales-baking-container') {
                const index = Array.from(container.children).indexOf(line);
                const leftContainer = document.getElementById('sales-cooking-container');
                if (leftContainer && leftContainer.children[index]) {
                    targetDateCol = leftContainer.children[index].querySelector('.date-col');
                }
            } else {
                targetDateCol = line.querySelector('.date-col');
            }
            
            if (targetDateCol && targetDateCol.textContent.trim() === '') {
                const now = new Date();
                const days = ['일', '월', '화', '수', '목', '금', '토'];
                targetDateCol.textContent = `${now.getMonth() + 1}/${now.getDate()}(${days[now.getDay()]})`;
            }
        }
    }
    
    triggerAutoSave();
}

// 카드 팝업 상태
let activeMethodCol = null;

function handleClick(e) {
    const target = e.target;
    
    // method-col (결제수단칸) 클릭 시 팝업창
    if (target.classList.contains('method-col')) {
        showCardPopup(target);
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
            <button onclick="selectCardOption('(선)')">(선)</button>
            <button onclick="selectCardOption('(환불)')">(환불)</button>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
    
    const style = document.createElement('style');
    style.textContent = `
        #card-selector-popup {
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-radius: 4px;
            padding: 4px;
            display: flex;
            flex-direction: column;
            gap: 2px;
            width: 80px;
            z-index: 10000;
        }
        #card-selector-popup.hidden {
            display: none;
        }
        #card-selector-popup button {
            background: transparent;
            border: none;
            padding: 8px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            text-align: left;
            width: 100%;
        }
        #card-selector-popup button:hover {
            background: #f1f5f9;
        }
    `;
    document.head.appendChild(style);
}

function showCardPopup(methodColEl) {
    activeMethodCol = methodColEl;
    const popup = document.getElementById('card-selector-popup');
    popup.classList.remove('hidden');
    
    // 요소의 위치 계산하여 바로 아래에 고정 (드롭다운)
    const rect = methodColEl.getBoundingClientRect();
    popup.style.left = (rect.left + window.scrollX - 20) + 'px';
    popup.style.top = (rect.bottom + window.scrollY + 5) + 'px';
}

function hideCardPopup() {
    const popup = document.getElementById('card-selector-popup');
    if (popup) popup.classList.add('hidden');
}

window.selectCardOption = function(optionText) {
    if (activeMethodCol) {
        // 기존 텍스트를 아예 날리고 새 값으로 덮어씀 (append 방지)
        activeMethodCol.textContent = optionText;
        hideCardPopup();
        triggerAutoSave();
    }
}

// 빈 줄이 부족하면 항상 유지하도록 + 레이아웃 동기화
function ensureMinimumLines() {
    const expenseContainer = document.getElementById('expense-container');
    const cookingContainer = document.getElementById('sales-cooking-container');
    const bakingContainer = document.getElementById('sales-baking-container');
    
    if (expenseContainer) {
        const emptyLines = Array.from(expenseContainer.children).filter(line => line.textContent.trim() === '').length;
        if (emptyLines < 5) {
            for(let i=0; i<10; i++) {
                expenseContainer.insertAdjacentHTML('beforeend', `
                    <div class="entry-line">
                        <div class="date-col" contenteditable="true"></div>
                        <div class="desc-col" contenteditable="true"></div>
                        <div class="amount-col" contenteditable="true"></div>
                        <div class="method-col" contenteditable="true"></div>
                    </div>
                `);
            }
        }
    }
    
    if (cookingContainer && bakingContainer) {
        // 기존에 잘못 들어간 bakingContainer의 date-col 제거
        bakingContainer.querySelectorAll('.date-col').forEach(el => el.remove());
        
        const cookLines = cookingContainer.children.length;
        const bakeLines = bakingContainer.children.length;
        let maxLines = Math.max(cookLines, bakeLines);
        
        const cookEmpty = Array.from(cookingContainer.children).filter(line => line.textContent.trim() === '').length;
        const bakeEmpty = Array.from(bakingContainer.children).filter(line => line.textContent.trim() === '').length;
        
        if (Math.min(cookEmpty, bakeEmpty) < 5) {
            maxLines += 10;
        }
        
        while (cookingContainer.children.length < maxLines) {
            cookingContainer.insertAdjacentHTML('beforeend', `
                <div class="entry-line">
                    <div class="date-col" contenteditable="true"></div>
                    <div class="desc-col" contenteditable="true"></div>
                    <div class="amount-col" contenteditable="true"></div>
                    <div class="method-col" contenteditable="true"></div>
                </div>
            `);
        }
        
        while (bakingContainer.children.length < maxLines) {
            bakingContainer.insertAdjacentHTML('beforeend', `
                <div class="entry-line">
                    <div class="desc-col" contenteditable="true"></div>
                    <div class="amount-col" contenteditable="true"></div>
                    <div class="method-col" contenteditable="true"></div>
                </div>
            `);
        }
    }
}
