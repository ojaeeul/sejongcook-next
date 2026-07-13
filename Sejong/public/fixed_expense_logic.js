// ==================== 고정지출 관리 기능 ====================

let fixedExpensesData = [];

// 1. 고정지출 설정 모달 열기 및 데이터 로드
window.openFixedExpenseConfig = async function() {
    const modal = document.getElementById('fixed-expense-modal');
    if (modal) modal.classList.remove('hidden');
    
    // 데이터 불러오기
    try {
        const res = await fetch('/api/sejong/expense?year=fixed_expenses_config&t=' + Date.now());
        const data = await res.json();
        
        if (data && Array.isArray(data.items) && data.items.length > 0) {
            fixedExpensesData = data.items;
        } else {
            // 기본값 세팅 (백업에서 복원한 원장님 기존 데이터)
            fixedExpensesData = [
                { day: 1, desc: "최지인강사 급여", amount: "2,200,000" },
                { day: 1, desc: "이미선강사 급여", amount: "2,200,000" },
                { day: 4, desc: "관리비", amount: "1,850,000" },
                { day: 10, desc: "606호 임대료", amount: "440,000" },
                { day: 10, desc: "2604사회보험", amount: "1,115,000" },
                { day: 10, desc: "국민은행 적금", amount: "700,000" },
                { day: 15, desc: "예스밴이지체크", amount: "9,900" },
                { day: 15, desc: "삼성카드", amount: "500,000" },
                { day: 22, desc: "코웨이렌탈06", amount: "30,900" },
                { day: 23, desc: "고정지출", amount: "300,000" },
                { day: 25, desc: "kb사업자카드", amount: "800,000" },
                { day: 25, desc: "kb쿠팡카드", amount: "1,700,000" },
                { day: 25, desc: "유라세무회계", amount: "110,000" },
                { day: 26, desc: "도시가스06x6", amount: "75,000" },
                { day: 26, desc: "LGU+인터넷", amount: "49,280" }
            ];
            
            // 초기 접속 시 DB에 기본값 저장해두기
            const payload = { expenseYear: 'fixed_expenses_config', items: fixedExpensesData };
            fetch('/api/sejong/expense', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }
        if (window.renderFixedExpenseList) window.renderFixedExpenseList();
    } catch(e) {
        console.error("Failed to load fixed expenses config:", e);
        alert("고정지출 설정을 불러오는 데 실패했습니다.");
    }
};

// 2. 고정지출 모달 닫기
window.closeFixedExpenseConfig = function() {
    const modal = document.getElementById('fixed-expense-modal');
    if (modal) modal.classList.add('hidden');
};

// 3. 고정지출 리스트 렌더링
window.renderFixedExpenseList = function() {
    const listEl = document.getElementById('fixed-expense-list');
    if (!listEl) return;
    
    listEl.innerHTML = '';
    
    // 날짜순 정렬
    fixedExpensesData.sort((a, b) => parseInt(a.day) - parseInt(b.day));
    
    fixedExpensesData.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center border-b py-2 px-1';
        div.innerHTML = `
            <div class="flex gap-4 items-center">
                <span class="w-20 font-bold text-gray-700 bg-gray-100 rounded px-2 py-1 text-center">매월 ${item.day}일</span>
                <span class="w-48 text-gray-800 font-medium">${item.desc}</span>
                <span class="text-blue-600 font-semibold">${item.amount}</span>
            </div>
            <button onclick="removeFixedExpense(${index})" class="text-red-500 hover:text-red-700 text-sm px-3 py-1 border border-red-200 rounded bg-red-50 hover:bg-red-100 transition-colors">삭제</button>
        `;
        listEl.appendChild(div);
    });
};

// 4. 고정지출 항목 추가
window.addFixedExpense = function() {
    const day = document.getElementById('fe-day').value;
    const desc = document.getElementById('fe-desc').value;
    const amount = document.getElementById('fe-amount').value;
    
    if (!day || !desc || !amount) {
        alert("날짜, 내용, 금액을 모두 입력해주세요.");
        return;
    }
    
    fixedExpensesData.push({ day: parseInt(day), desc, amount });
    if (window.renderFixedExpenseList) window.renderFixedExpenseList();
    
    document.getElementById('fe-day').value = '';
    document.getElementById('fe-desc').value = '';
    document.getElementById('fe-amount').value = '';
};

// 5. 고정지출 항목 삭제
window.removeFixedExpense = function(index) {
    if (confirm(`'${fixedExpensesData[index].desc}' 내역을 고정지출에서 삭제하시겠습니까?`)) {
        fixedExpensesData.splice(index, 1);
        if (window.renderFixedExpenseList) window.renderFixedExpenseList();
    }
};

// 6. 고정지출 설정 저장
window.saveFixedExpenseConfig = async function() {
    try {
        const payload = {
            expenseYear: 'fixed_expenses_config',
            items: fixedExpensesData
        };
        const res = await fetch('/api/sejong/expense', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            alert("✅ 고정지출 설정이 안전하게 저장되었습니다.");
            closeFixedExpenseConfig();
            
            // 방금 저장한 설정을 현재 달력에 반영할지 물어보기
            if (confirm("저장된 고정지출 내역을 이번 달 장부에도 바로 기재할까요?")) {
                if (window.applyFixedExpensesToNotebook) window.applyFixedExpensesToNotebook();
            }
        } else {
            alert("저장 실패");
        }
    } catch(e) {
        console.error(e);
        alert("저장 중 오류 발생");
    }
};

// 7. 현재 달에 고정지출 기재
window.applyFixedExpensesToNotebook = async function(auto = false) {
    let targetMonth;
    if (auto) {
        targetMonth = new Date().getMonth() + 1;
    } else {
        const monthInput = prompt("몇 월의 고정비를 장부에 반영하시겠습니까? (예: 7)", new Date().getMonth() + 1);
        if (!monthInput) return;
        targetMonth = parseInt(monthInput.trim(), 10);
        
        if (isNaN(targetMonth) || targetMonth < 1 || targetMonth > 12) {
            alert("올바른 월을 입력해주세요. (1~12)");
            return;
        }
    }
    
    const yearElem = document.getElementById('expense-year');
    const targetYear = yearElem ? parseInt(yearElem.textContent.trim()) : new Date().getFullYear();
    
    let configData = fixedExpensesData;
    if (!configData || configData.length === 0) {
        try {
            const res = await fetch('/api/sejong/expense?year=fixed_expenses_config&t=' + Date.now());
            const data = await res.json();
            if (data && Array.isArray(data.items)) {
                configData = data.items;
                fixedExpensesData = configData;
            }
        } catch(e) {}
    }
    
    if (!configData || configData.length === 0) {
        if (!auto) alert("설정된 고정지출 항목이 없습니다. 상단의 지갑 아이콘을 눌러 먼저 설정해주세요.");
        return;
    }
    
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const expenseContainer = document.getElementById('expense-container');
    if (!expenseContainer) return;
    
    const existingLines = expenseContainer.querySelectorAll('.entry-line');
    const existingData = new Set();
    
    existingLines.forEach(line => {
        const dateCol = line.querySelector('.date-col');
        const descCol = line.querySelector('.desc-col');
        const dateStr = dateCol ? dateCol.textContent.trim() : "";
        const desc = descCol ? descCol.textContent.trim() : "";
        if (desc && dateStr) {
            existingData.add(`${dateStr}_${desc}`);
        }
    });
    
    const toAdd = [];
    const currentDay = new Date().getDate();
    
    configData.forEach(exp => {
        // 자동 실행일 경우, 설정된 날짜가 '오늘'이거나 '오늘 이전'인 것만 기재
        if (auto && parseInt(exp.day) > currentDay) return;
        
        const dateObj = new Date(targetYear, targetMonth - 1, exp.day);
        const dateStr = `${targetMonth}/${exp.day}(${days[dateObj.getDay()]})`;
        const key = `${dateStr}_${exp.desc}`;
        // 이미 기재된 내역(날짜+내용이 같은 경우)은 제외
        if (!existingData.has(key)) {
            toAdd.push({ dateStr, exp });
        }
    });
    
    if (toAdd.length === 0) {
        if (!auto) alert(`${targetMonth}월의 고정지출 내역이 이미 장부에 모두 기록되어 있습니다!`);
        return;
    }
    
    let addIndex = 0;
    existingLines.forEach(line => {
        if (addIndex >= toAdd.length) return;
        const dateCol = line.querySelector('.date-col');
        const descCol = line.querySelector('.desc-col');
        const amountCol = line.querySelector('.amount-col');
        const methodCol = line.querySelector('.method-col');
        
        const isRowEmpty = (!dateCol || !dateCol.textContent.trim()) && (!descCol || !descCol.textContent.trim()) && (!amountCol || !amountCol.textContent.trim());
        if (isRowEmpty) {
            const item = toAdd[addIndex];
            if (dateCol) dateCol.textContent = item.dateStr;
            if (descCol) descCol.textContent = item.exp.desc;
            if (amountCol) amountCol.textContent = item.exp.amount + '.—';
            if (methodCol) methodCol.textContent = '(계)';
            
            // 시각적 강조 효과
            line.style.backgroundColor = '#e0f2fe'; // 연한 파란색
            setTimeout(() => { line.style.backgroundColor = ''; }, 2000);
            
            addIndex++;
        }
    });
    
    // 빈 줄이 모자라면 새 줄 생성
    while(addIndex < toAdd.length) {
        const item = toAdd[addIndex];
        const newRow = document.createElement('div');
        newRow.className = 'entry-line';
        newRow.innerHTML = `
            <div class="date-col" contenteditable="true" spellcheck="false">${item.dateStr}</div>
            <div class="desc-col" contenteditable="true" spellcheck="false">${item.exp.desc}</div>
            <div class="amount-col" contenteditable="true" spellcheck="false">${item.exp.amount}.—</div>
            <div class="method-col" contenteditable="true" spellcheck="false">(계)</div>
        `;
        newRow.style.backgroundColor = '#e0f2fe';
        setTimeout(() => { newRow.style.backgroundColor = ''; }, 2000);
        expenseContainer.appendChild(newRow);
        addIndex++;
    }
    
    if (window.ensureMinimumLines) window.ensureMinimumLines();
    if (window.hideDuplicateDates) window.hideDuplicateDates();
    if (window.updateExpensePagination) window.updateExpensePagination();
    if (window.triggerAutoSave) window.triggerAutoSave();
    
    if (!auto) {
        alert(`🎉 총 ${toAdd.length}건의 고정비가 장부에 기재되었습니다!\n(날짜순으로 정리하시려면 상단의 [정렬] 버튼을 눌러주세요)`);
    } else {
        console.log(`[Auto] ${toAdd.length}건의 고정비 자동 기재 완료.`);
    }
};
