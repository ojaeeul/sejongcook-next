import re

def fix_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    if "notebook-align-btn" not in html:
        old_btn = """    <button id="notebook-print-btn" title="인쇄하기" onclick="window.print()" style="position: absolute; top: 10px; right: 60px; z-index: 100; background: none; border: none; cursor: pointer; color: #64748b; padding: 5px;">"""
        new_btn = """    <button id="notebook-align-btn" title="날짜별 자동 줄맞춤 정렬" onclick="if(window.alignAllDates) alignAllDates();" style="position: absolute; top: 10px; right: 100px; z-index: 100; background: none; border: none; cursor: pointer; color: #64748b; padding: 5px;">
        <i class="material-icons">sort</i>
    </button>
    <button id="notebook-print-btn" title="인쇄하기" onclick="window.print()" style="position: absolute; top: 10px; right: 60px; z-index: 100; background: none; border: none; cursor: pointer; color: #64748b; padding: 5px;">"""
        html = html.replace(old_btn, new_btn)

    old_title = """<div class="page-title">지출내역</div>"""
    new_title = """<div class="page-title"><span id="expense-year" contenteditable="true" spellcheck="false" title="클릭하여 년도 수정" oninput="if(window.triggerAutoSave) triggerAutoSave()"></span>년 지출내역</div>"""
    html = html.replace(old_title, new_title)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

fix_html('Sejong/SejongAttendance/public/expense.html')

def fix_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    old_load = """        if (data && data.bakingHTML) {
            document.getElementById('sales-baking-container').innerHTML = data.bakingHTML;
        }"""
    new_load = """        if (data && data.bakingHTML) {
            document.getElementById('sales-baking-container').innerHTML = data.bakingHTML;
        }
        if (data && data.expenseYear) {
            const yearElem = document.getElementById('expense-year');
            if (yearElem) yearElem.textContent = data.expenseYear;
        } else {
            const yearElem = document.getElementById('expense-year');
            if (yearElem && !yearElem.textContent) yearElem.textContent = new Date().getFullYear();
        }"""
    if "data.expenseYear" not in js:
        js = js.replace(old_load, new_load)

    old_save = """    const payload = {
        id: "notebook_state",
        leftHTML,
        cookingHTML,
        bakingHTML,
        updatedAt: new Date().toISOString()
    };"""
    new_save = """    const yearElem = document.getElementById('expense-year');
    const expenseYear = yearElem ? yearElem.textContent.trim() : new Date().getFullYear();
    const payload = {
        id: "notebook_state",
        leftHTML,
        cookingHTML,
        bakingHTML,
        expenseYear,
        updatedAt: new Date().toISOString()
    };"""
    if "expenseYear:" not in js:
        js = js.replace(old_save, new_save)

    if "alignAllDates" not in js:
        align_code = """
window.alignAllDates = function() {
    if (!confirm("양쪽 페이지의 모든 내역을 날짜순으로 자동 정렬하고, 같은 날짜끼리 줄을 맞추시겠습니까?")) return;
    
    const expenseContainer = document.getElementById('expense-container');
    const cookingContainer = document.getElementById('sales-cooking-container');
    const bakingContainer = document.getElementById('sales-baking-container');
    
    const extractItems = (container) => {
        if (!container) return [];
        const items = [];
        let lastDate = '';
        Array.from(container.children).forEach(line => {
            if (line.classList.contains('hidden-page-line')) line.classList.remove('hidden-page-line');
            
            const dateCol = line.querySelector('.date-col');
            const descCol = line.querySelector('.desc-col');
            const amountCol = line.querySelector('.amount-col');
            const methodCol = line.querySelector('.method-col');
            
            const dateStr = dateCol ? dateCol.textContent.trim() : '';
            const desc = descCol ? descCol.textContent.trim() : '';
            const amount = amountCol ? amountCol.textContent.trim() : '';
            const method = methodCol ? methodCol.textContent.trim() : '';
            
            if (dateStr) lastDate = dateStr;
            
            if (desc || amount || method || dateStr) {
                items.push({
                    date: lastDate,
                    descHtml: descCol ? descCol.innerHTML : '',
                    amountHtml: amountCol ? amountCol.innerHTML : '',
                    methodHtml: methodCol ? methodCol.innerHTML : '',
                    paymentIdCook: line.getAttribute('data-payment-id-cook') || '',
                    paymentIdBake: line.getAttribute('data-payment-id-bake') || '',
                    className: line.className
                });
            }
        });
        return items;
    };
    
    const expItems = extractItems(expenseContainer);
    const cookItems = extractItems(cookingContainer);
    const bakeItems = extractItems(bakingContainer);
    
    const allDates = new Set();
    expItems.forEach(i => { if(i.date) allDates.add(i.date); });
    cookItems.forEach(i => { if(i.date) allDates.add(i.date); });
    bakeItems.forEach(i => { if(i.date) allDates.add(i.date); });
    
    const parseDate = (dStr) => {
        const match = dStr.match(/(\d+)\/(\d+)/);
        if (!match) return 9999;
        return parseInt(match[1]) * 100 + parseInt(match[2]);
    };
    const sortedDates = Array.from(allDates).sort((a, b) => parseDate(a) - parseDate(b));
    
    if (expenseContainer) expenseContainer.innerHTML = '';
    if (cookingContainer) cookingContainer.innerHTML = '';
    if (bakingContainer) bakingContainer.innerHTML = '';
    
    const createRow = (dateStr, item, isLeftCol = true, isRightRight = false) => {
        const div = document.createElement('div');
        div.className = item ? item.className.replace('hidden-page-line', '').trim() : 'entry-line';
        if (item && item.paymentIdCook) div.setAttribute('data-payment-id-cook', item.paymentIdCook);
        if (item && item.paymentIdBake) div.setAttribute('data-payment-id-bake', item.paymentIdBake);
        
        let html = '';
        if (!isRightRight) {
            html += `<div class="date-col" contenteditable="true" spellcheck="false">${dateStr}</div>`;
        }
        html += `<div class="desc-col" contenteditable="true" spellcheck="false">${item ? item.descHtml : ''}</div>`;
        html += `<div class="amount-col" contenteditable="true" spellcheck="false">${item ? item.amountHtml : ''}</div>`;
        html += `<div class="method-col" contenteditable="true" spellcheck="false">${item ? item.methodHtml : ''}</div>`;
        
        div.innerHTML = html;
        return div;
    };
    
    sortedDates.forEach(date => {
        const dExp = expItems.filter(i => i.date === date);
        const dCook = cookItems.filter(i => i.date === date);
        const dBake = bakeItems.filter(i => i.date === date);
        
        const maxRows = Math.max(dExp.length, dCook.length, dBake.length);
        
        for (let i = 0; i < maxRows; i++) {
            if (expenseContainer) expenseContainer.appendChild(createRow(date, dExp[i], true, false));
            if (cookingContainer) cookingContainer.appendChild(createRow(date, dCook[i], false, false));
            if (bakingContainer) bakingContainer.appendChild(createRow(date, dBake[i], false, true));
        }
        
        // 그룹 구분을 위한 빈 줄 1줄 추가
        if (expenseContainer) expenseContainer.appendChild(createRow('', null, true, false));
        if (cookingContainer) cookingContainer.appendChild(createRow('', null, false, false));
        if (bakingContainer) bakingContainer.appendChild(createRow('', null, false, true));
    });
    
    ensureMinimumLines();
    hideDuplicateDates();
    updateExpensePagination();
    saveNotebookData();
    
    setTimeout(() => alert("날짜별 정렬 및 줄 맞춤이 완료되었습니다!"), 100);
};
"""
        js += align_code

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

fix_js('Sejong/SejongAttendance/public/expense_logic.js')
print("Logic updated")
