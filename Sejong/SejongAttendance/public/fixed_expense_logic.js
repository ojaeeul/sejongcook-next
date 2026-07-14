// ==================== 고정지출 관리 기능 ====================

let fixedExpensesData = [];

// 1. 고정지출 설정 모달 열기 및 데이터 로드
window.openFixedExpenseConfig = async function() {
    const modal = document.getElementById('fixed-expense-modal');
    if (modal) modal.style.display = 'flex';
    
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
    if (modal) modal.style.display = 'none';
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
        div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding: 8px 4px;';
        div.innerHTML = `
            <div style="display: flex; gap: 16px; align-items: center;">
                <span style="width: 80px; font-weight: bold; color: #444; background: #f3f4f6; border-radius: 4px; padding: 4px 8px; text-align: center;">매월 ${item.day}일</span>
                <span style="width: 200px; color: #333; font-weight: 500;">${item.desc}</span>
                <span style="color: #2563eb; font-weight: bold;">${item.amount}</span>
            </div>
            <div style="display: flex; gap: 8px;">
                <button onclick="editFixedExpense(${index})" style="color: #059669; border: 1px solid #a7f3d0; background: #ecfdf5; padding: 4px 12px; border-radius: 4px; font-size: 13px; cursor: pointer;">수정</button>
                <button onclick="removeFixedExpense(${index})" style="color: #dc2626; border: 1px solid #fecaca; background: #fef2f2; padding: 4px 12px; border-radius: 4px; font-size: 13px; cursor: pointer;">삭제</button>
            </div>
        `;
        listEl.appendChild(div);
    });
};

// 3.5 고정지출 항목 수정 (입력창으로 불러오기)
window.editFixedExpense = function(index) {
    const item = fixedExpensesData[index];
    document.getElementById('fe-day').value = item.day;
    document.getElementById('fe-desc').value = item.desc;
    document.getElementById('fe-amount').value = item.amount;
    
    // 항목을 지우고 다시 추가하도록 유도
    fixedExpensesData.splice(index, 1);
    if (window.renderFixedExpenseList) window.renderFixedExpenseList();
    
    // 입력창 포커스
    document.getElementById('fe-day').focus();
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
