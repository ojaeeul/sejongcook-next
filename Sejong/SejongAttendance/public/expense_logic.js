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
    notebook.addEventListener('focusout', handleFocusOut);
    
    // 초기 내용물이 비어있으면 기본 30줄 생성
    ensureMinimumLines();
    
    // 초기 로딩 및 결제 연동 후 최종적으로 중복 날짜 숨김 처리 적용
    hideDuplicateDates();
    updateExpensePagination();
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

        // DB에 잘못 저장된 고아(orphan) 태그들 청소 (entry-line이 아닌 자식 태그들 삭제)
        ['expense-container', 'sales-cooking-container', 'sales-baking-container'].forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                Array.from(container.children).forEach(child => {
                    if (!child.classList.contains('entry-line')) {
                        child.remove();
                    }
                });
            }
        });

    } catch (e) {
        console.error("Failed to load notebook data:", e);
    }
    
    fixMissingCols();
    hideDuplicateDates();
    updateExpensePagination();
    
    // 강제 contenteditable 적용
    document.querySelectorAll('.desc-col, .amount-col, .date-col, .method-col').forEach(col => {
        col.setAttribute('contenteditable', 'true');
        col.setAttribute('spellcheck', 'false');
    });
    if (typeof updateExpensePagination === 'function') updateExpensePagination();
}

function fixMissingCols() {
    document.querySelectorAll('.entry-line').forEach(line => {
        // date-col 확인 (좌측 페이지, 우측 첫번째 단, 그리고 페이지 바로 밑 빈칸)
        const isDirectChildOfPage = line.parentElement && line.parentElement.classList.contains('page');
        const needsDateCol = line.closest('#expense-container') || line.closest('#sales-cooking-container') || isDirectChildOfPage;
        if (needsDateCol) {
            let dateCol = line.querySelector('.date-col');
            if (!dateCol) {
                dateCol = document.createElement('div');
                dateCol.className = 'date-col';
                dateCol.setAttribute('contenteditable', 'true');
                dateCol.setAttribute('spellcheck', 'false');
                line.insertBefore(dateCol, line.firstChild);
            }
        }

        // desc-col 확인
        let descCol = line.querySelector('.desc-col');
        if (!descCol) {
            descCol = document.createElement('div');
            descCol.className = 'desc-col';
            descCol.setAttribute('contenteditable', 'true');
            descCol.setAttribute('spellcheck', 'false');
            line.appendChild(descCol);
        }
        
        // amount-col 확인
        let amountCol = line.querySelector('.amount-col');
        if (!amountCol) {
            amountCol = document.createElement('div');
            amountCol.className = 'amount-col';
            amountCol.setAttribute('contenteditable', 'true');
            amountCol.setAttribute('spellcheck', 'false');
            line.appendChild(amountCol);
        } else if (!amountCol.nextElementSibling || !amountCol.nextElementSibling.classList.contains('method-col')) {
            // 구버전 데이터 마이그레이션 ((카) 분리)
            const methodCol = document.createElement('div');
            methodCol.className = 'method-col';
            methodCol.setAttribute('contenteditable', 'true');
            methodCol.setAttribute('spellcheck', 'false');
            
            let text = amountCol.textContent;
            const match = text.match(/\s*(\([^)]+\))\s*$/);
            if (match) {
                methodCol.textContent = match[1];
                amountCol.textContent = text.replace(match[0], '');
            }
            amountCol.parentNode.insertBefore(methodCol, amountCol.nextSibling);
        }
        
        // method-col이 혹시라도 없으면 (위의 if-else에 걸리지 않은 경우)
        let methodCol = line.querySelector('.method-col');
        if (!methodCol) {
            methodCol = document.createElement('div');
            methodCol.className = 'method-col';
            methodCol.setAttribute('contenteditable', 'true');
            methodCol.setAttribute('spellcheck', 'false');
            line.appendChild(methodCol);
        }
        
        // 빈 줄 정리 (스페이스바나 <br>만 있으면 완전히 비워서 CSS :empty가 작동하게 함)
        line.querySelectorAll('div[contenteditable="true"]').forEach(col => {
            if (col.textContent.trim() === '') {
                col.innerHTML = '';
            }
        });
    });
}

// 자동 저장 (Debounce)
let saveTimeout;
function triggerAutoSave() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveNotebookData, 1000);
    
    // 중복 날짜 숨김 처리 (입력 중에도 반응형으로 작동)
    hideDuplicateDates();
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
    
    const getText = (node, selector) => {
        if (!node) return '';
        const el = node.querySelector(selector);
        return el ? el.textContent.trim() : '';
    };

    const insertEmptyRowAt = (index) => {
        const cookLine = document.createElement('div');
        cookLine.className = 'entry-line';
        cookLine.innerHTML = `<div class="date-col" contenteditable="true"></div><div class="desc-col" contenteditable="true"></div><div class="amount-col" contenteditable="true"></div><div class="method-col" contenteditable="true"></div>`;
        
        const bakeLine = document.createElement('div');
        bakeLine.className = 'entry-line';
        bakeLine.innerHTML = `<div class="desc-col" contenteditable="true"></div><div class="amount-col" contenteditable="true"></div><div class="method-col" contenteditable="true"></div>`;
        
        if (index < cookingContainer.children.length) {
            cookingContainer.insertBefore(cookLine, cookingContainer.children[index]);
        } else {
            cookingContainer.appendChild(cookLine);
        }
        
        if (index < bakingContainer.children.length) {
            bakingContainer.insertBefore(bakeLine, bakingContainer.children[index]);
        } else {
            bakingContainer.appendChild(bakeLine);
        }
    };

    // 1. 취소된 항목(unpaid로 변경된 항목) 내용 지우기
    const existingAutoItems = Array.from(document.querySelectorAll('.tuition-auto'));
    existingAutoItems.forEach(el => {
        const pIdCook = el.getAttribute('data-payment-id-cook');
        const pIdBake = el.getAttribute('data-payment-id-bake');
        const pIdLegacy = el.getAttribute('data-payment-id');
        const pId = pIdCook || pIdBake || pIdLegacy;
        
        if (pId) {
            const stillPaid = paidPayments.some(p => `${p.memberId}_${p.year}_${p.month}` === pId);
            if (!stillPaid) {
                if (el.querySelector('.desc-col')) el.querySelector('.desc-col').textContent = '';
                if (el.querySelector('.amount-col')) el.querySelector('.amount-col').textContent = '';
                if (el.querySelector('.method-col')) el.querySelector('.method-col').textContent = '';
                el.removeAttribute('data-payment-id-cook');
                el.removeAttribute('data-payment-id-bake');
                el.removeAttribute('data-payment-id');
                el.classList.remove('tuition-auto');
                hasChanges = true;
            }
        }
    });

    paidPayments.forEach(p => {
        const pId = `${p.memberId}_${p.year}_${p.month}`;
        
        let existingCook = cookingContainer.querySelector(`[data-payment-id-cook="${pId}"]`);
        let existingBake = bakingContainer.querySelector(`[data-payment-id-bake="${pId}"]`);
        if (!existingCook) existingCook = cookingContainer.querySelector(`[data-payment-id="${pId}"]`);
        if (!existingBake) existingBake = bakingContainer.querySelector(`[data-payment-id="${pId}"]`);
        
        if (existingCook && !existingCook.closest('#sales-cooking-container')) existingCook = null;
        if (existingBake && !existingBake.closest('#sales-baking-container')) existingBake = null;
        
        const member = membersData.find(m => String(m.id) === String(p.memberId));
        const memberName = member ? member.name : '알수없음';
        const courseName = p.course || (member ? member.course : '');
        
        if (existingCook || existingBake) {
            let existingNode = existingCook || existingBake;
            let currentDesc = existingNode.querySelector('.desc-col') ? existingNode.querySelector('.desc-col').textContent.trim() : '';
            if (!currentDesc) {
                // Re-fill if accidentally cleared
                existingNode.querySelector('.desc-col').textContent = `${memberName} ${courseName ? '(' + courseName.split('(')[0] + ')' : ''}`;
                existingNode.querySelector('.amount-col').textContent = Number(p.amount || 0).toLocaleString();
                existingNode.querySelector('.method-col').textContent = '(카)';
                hasChanges = true;
            }
            return;
        }
        
        let amountStr = Number(p.amount || 0).toLocaleString('en-US');
        amountStr = amountStr.replace(/,000$/, '.—');
        const dateObj = p.updatedAt ? new Date(p.updatedAt) : new Date();
        const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}(${['일','월','화','수','목','금','토'][dateObj.getDay()]})`;
        
        const isBaking = BAKING_COURSES.some(bc => courseName.includes(bc));
        const descHtml = memberName;
        
        const currentCookRows = Array.from(cookingContainer.children);
        const currentBakeRows = Array.from(bakingContainer.children);
        const currentMaxLen = Math.max(currentCookRows.length, currentBakeRows.length);
        
        let lastUsedIndex = -1;
        let lastUsedDate = '';
        
        for (let i = 0; i < currentMaxLen; i++) {
            const cRow = currentCookRows[i];
            const bRow = currentBakeRows[i];
            
            const dateVal = getText(cRow, '.date-col');
            const cDesc = getText(cRow, '.desc-col');
            const cAmt = getText(cRow, '.amount-col');
            const bDesc = getText(bRow, '.desc-col');
            const bAmt = getText(bRow, '.amount-col');
            
            if (dateVal) {
                lastUsedDate = dateVal;
            }
            if (dateVal || cDesc || cAmt || bDesc || bAmt) {
                lastUsedIndex = i;
                // Update lastUsedDate specifically for the last used row to know the current block's date
                if (dateVal) lastUsedDate = dateVal;
            }
        }
        
        let targetIndex = -1;
        let isNewDay = false;
        
        if (lastUsedDate === dateStr) {
            let blockStartIndex = lastUsedIndex;
            while (blockStartIndex > 0 && !getText(currentCookRows[blockStartIndex], '.date-col')) {
                blockStartIndex--;
            }
            
            for (let i = blockStartIndex; i <= lastUsedIndex; i++) {
                const isMySideEmpty = isBaking ? 
                    (!getText(currentBakeRows[i], '.desc-col') && !getText(currentBakeRows[i], '.amount-col')) :
                    (!getText(currentCookRows[i], '.desc-col') && !getText(currentCookRows[i], '.amount-col'));
                    
                if (isMySideEmpty) {
                    targetIndex = i;
                    break;
                }
            }
            
            if (targetIndex === -1) {
                targetIndex = lastUsedIndex + 1;
            }
        } else {
            // 다른 날짜면 1줄 띄우고 새 날짜로 시작 (이전 패치에서 수정됨)
            if (lastUsedIndex >= 0) {
                targetIndex = lastUsedIndex + 1;
            } else {
                targetIndex = 0;
            }
            isNewDay = true;
        }
        
        while (cookingContainer.children.length <= targetIndex) {
            insertEmptyRowAt(cookingContainer.children.length);
        }
        while (bakingContainer.children.length <= targetIndex) {
            insertEmptyRowAt(bakingContainer.children.length);
        }
        
        const cRow = cookingContainer.children[targetIndex];
        const bRow = bakingContainer.children[targetIndex];
        
        if (isBaking) {
            bRow.classList.add('tuition-auto');
            bRow.setAttribute('data-payment-id-bake', pId);
            bRow.querySelector('.desc-col').textContent = descHtml;
            bRow.querySelector('.amount-col').textContent = amountStr;
            bRow.querySelector('.method-col').textContent = '(카)';
            
            if (isNewDay && cRow.querySelector('.date-col')) {
                cRow.querySelector('.date-col').textContent = dateStr;
            }
        } else {
            cRow.classList.add('tuition-auto');
            cRow.setAttribute('data-payment-id-cook', pId);
            if (isNewDay && cRow.querySelector('.date-col')) {
                cRow.querySelector('.date-col').textContent = dateStr;
            }
            cRow.querySelector('.desc-col').textContent = descHtml;
            cRow.querySelector('.amount-col').textContent = amountStr;
            cRow.querySelector('.method-col').textContent = '(카)';
        }
        
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
        let targetLines = expenseContainer.children.length;
        if (emptyLines < 5) targetLines += 10;
        targetLines = Math.ceil(Math.max(targetLines, 32) / 32) * 32; // 최소 32줄 유지하여 화면 꽉 채움
        
        while (expenseContainer.children.length < targetLines) {
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
        maxLines = Math.max(maxLines, 30); // 우측 페이지는 48px 여백이 있으므로 최소 30줄 유지
        
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

function handleFocusOut(e) {
    // 빈 칸(스페이스바, <br> 등)만 남았을 경우 완전히 비워서 placeholder(:empty)가 보이게 함
    if (e.target.hasAttribute('contenteditable')) {
        if (e.target.textContent.trim() === '') {
            e.target.innerHTML = '';
        }
    }

    if (e.target.classList.contains('amount-col')) {
        let raw = e.target.textContent.trim();
        if (!raw) return;
        
        let isNegative = raw.startsWith('(-)') || raw.startsWith('-');
        if (isNegative) {
            raw = raw.replace(/^(\(-\)|-)\s*/, '');
        }
        
        // 사용자가 실수로 이미 .— 입력했거나, 쉼표가 있는 경우를 위해 숫자만 추출
        let numStr = raw.replace(/\.—/g, '000').replace(/\.-/g, '000').replace(/,/g, '');
        
        if (!isNaN(numStr) && numStr !== '') {
            let num = Number(numStr);
            let formatted = num.toLocaleString('en-US');
            // 뒤의 ,000 을 .— (긴 하이픈)으로 교체
            formatted = formatted.replace(/,000$/, '.—');
            
            let resultText = (isNegative ? '(-) ' : '') + formatted;
            if (e.target.textContent !== resultText) {
                e.target.textContent = resultText;
                if (typeof hasChanges !== 'undefined') hasChanges = true;
                if (typeof saveNotebookData === 'function') saveNotebookData();
            }
        }
    }
    
    // 포커스를 잃었을 때도 중복 날짜 체크 수행 (값이 바뀌었을 수 있으므로)
    hideDuplicateDates();
}

function hideDuplicateDates() {
    const containers = [
        document.getElementById('expense-container'),
        document.getElementById('sales-cooking-container')
    ];
    
    containers.forEach(container => {
        if (!container) return;
        let lastDate = null;
        
        const rows = container.querySelectorAll('.entry-line');
        rows.forEach(row => {
            const dateCol = row.querySelector('.date-col');
            if (!dateCol) return;
            
            const currentDate = dateCol.textContent.trim();
            dateCol.classList.remove('duplicate-date');
            
            if (currentDate !== '') {
                if (currentDate === lastDate) {
                    dateCol.classList.add('duplicate-date');
                } else {
                    lastDate = currentDate;
                }
            }
        });
    });
}

// --- Expense Pagination Logic ---
let currentExpensePage = 0;
const LINES_PER_PAGE = 32;

function updateExpensePagination() {
    const expenseContainer = document.getElementById('expense-container');
    const cookingContainer = document.getElementById('sales-cooking-container');
    const bakingContainer = document.getElementById('sales-baking-container');
    
    // Check if pagination should be enabled
    if (!expenseContainer) return;
    
    const lines = expenseContainer.querySelectorAll('.entry-line');
    const totalLines = lines.length;
    const totalPages = Math.max(1, Math.ceil(totalLines / LINES_PER_PAGE));
    
    // Ensure current page is valid
    if (currentExpensePage >= totalPages) currentExpensePage = totalPages - 1;
    if (currentExpensePage < 0) currentExpensePage = 0;
    
    const startIdx = currentExpensePage * LINES_PER_PAGE;
    const endIdx = startIdx + LINES_PER_PAGE;
    
    // Update Expense List
    lines.forEach((line, index) => {
        if (index >= startIdx && index < endIdx) {
            line.classList.remove('hidden-page-line');
        } else {
            line.classList.add('hidden-page-line');
        }
    });
    
    // Update Sales Cooking List
    if (cookingContainer) {
        cookingContainer.querySelectorAll('.entry-line').forEach((line, index) => {
            if (index >= startIdx && index < endIdx) {
                line.classList.remove('hidden-page-line');
            } else {
                line.classList.add('hidden-page-line');
            }
        });
    }
    
    // Update Sales Baking List
    if (bakingContainer) {
        bakingContainer.querySelectorAll('.entry-line').forEach((line, index) => {
            if (index >= startIdx && index < endIdx) {
                line.classList.remove('hidden-page-line');
            } else {
                line.classList.add('hidden-page-line');
            }
        });
    }
    
    // Update Indicator & Buttons
    const indicator = document.getElementById('expense-page-indicator');
    const prevBtn = document.getElementById('expense-prev-btn');
    const nextBtn = document.getElementById('expense-next-btn');
    
    if (indicator) indicator.textContent = `${currentExpensePage + 1} / ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentExpensePage === 0;
    if (nextBtn) nextBtn.disabled = currentExpensePage >= totalPages - 1;
}

window.changeExpensePage = function(dir) {
    const expenseContainer = document.getElementById('expense-container');
    if (!expenseContainer) return;
    
    const totalLines = expenseContainer.querySelectorAll('.entry-line').length;
    const totalPages = Math.ceil(totalLines / LINES_PER_PAGE);
    
    if (currentExpensePage + dir < 0 || currentExpensePage + dir >= totalPages) return;

    // --- 3D Page Flip Animation ---
    const wrapper = document.querySelector('.notebook-wrapper');
    const pageRight = document.querySelector('.page-right');
    const pageLeft = document.querySelector('.page-left');
    
    if (!wrapper || !pageRight || !pageLeft) {
        // Fallback without animation
        currentExpensePage += dir;
        updateExpensePagination();
        return;
    }

    const oldPageHTMLRight = pageRight.innerHTML;
    const oldPageHTMLLeft = pageLeft.innerHTML;
    
    currentExpensePage += dir;
    updateExpensePagination();
    
    const newPageHTMLRight = pageRight.innerHTML;
    const newPageHTMLLeft = pageLeft.innerHTML;
    
    // Restore DOM temporarily for animation start
    currentExpensePage -= dir;
    updateExpensePagination();
    
    const flipContainer = document.createElement('div');
    flipContainer.className = 'flip-page-container';
    
    const front = document.createElement('div');
    front.className = 'flip-page-front page page-right';
    
    const back = document.createElement('div');
    back.className = 'flip-page-back page page-left';
    
    const staticUnderlay = document.createElement('div');
    staticUnderlay.className = 'flip-page-underlay page';
    
    if (dir > 0) {
        front.innerHTML = oldPageHTMLRight;
        back.innerHTML = newPageHTMLLeft;
        
        staticUnderlay.style.left = '0';
        staticUnderlay.classList.add('page-left');
        staticUnderlay.innerHTML = oldPageHTMLLeft;
        
        flipContainer.style.transformOrigin = 'left center';
        flipContainer.style.right = '0';
        flipContainer.style.transform = 'perspective(2000px) rotateY(0deg)';
        
    } else {
        front.innerHTML = oldPageHTMLLeft;
        back.innerHTML = newPageHTMLRight;
        
        staticUnderlay.style.right = '0';
        staticUnderlay.classList.add('page-right');
        staticUnderlay.innerHTML = oldPageHTMLRight;
        
        flipContainer.style.transformOrigin = 'right center';
        flipContainer.style.left = '0';
        flipContainer.style.transform = 'perspective(2000px) rotateY(0deg)';
    }
    
    flipContainer.appendChild(front);
    flipContainer.appendChild(back);
    
    wrapper.appendChild(staticUnderlay);
    wrapper.appendChild(flipContainer);
    
    setTimeout(() => {
        flipContainer.classList.add('flip');
        if (dir > 0) {
            flipContainer.style.transform = 'perspective(2000px) rotateY(-180deg)';
        } else {
            flipContainer.style.transform = 'perspective(2000px) rotateY(180deg)';
        }
        
        // Actually apply the new page after the flip starts to the main background
        currentExpensePage += dir;
        updateExpensePagination();
        
    }, 50);
    
    setTimeout(() => {
        flipContainer.remove();
        staticUnderlay.remove();
    }, 600);
};

// Override ensureMinimumLines to also update pagination
if (typeof originalEnsureMinimumLines === 'undefined') {
    const originalEnsureMinimumLines = ensureMinimumLines;
    window.ensureMinimumLines = function() {
        originalEnsureMinimumLines();
        if (typeof updateExpensePagination === 'function') {
            updateExpensePagination();
        }
    };
}
