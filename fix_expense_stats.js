const fs = require('fs');

const basePath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/';
const filePath = basePath + 'expense_stats.js';

let content = fs.readFileSync(filePath, 'utf8');

// The original content has:
/*
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`/api/sejong/expense?year=all&t=${Date.now()}`);
        if (!res.ok) throw new Error('Failed to fetch expenses');
        const data = await res.json();
        
        if (Array.isArray(data)) {
            processExpenseDataArray(data);
        } else {
            processExpenseDataArray([data]);
        }
        renderTotalOverall();
        renderYearList();
        
    } catch (e) {
        console.error("Failed to load expenses:", e);
        document.getElementById('totalExpenseAmount').innerText = "데이터 로딩 실패";
        document.getElementById('tier-year-list').innerHTML = `<div class="empty-state"><span class="material-icons">error_outline</span><span>데이터를 불러올 수 없습니다.</span></div>`;
    }
});
*/

const newContent = `
async function loadExpenseData() {
    try {
        const res = await fetch(\`/api/sejong/expense?year=all&t=\${Date.now()}\`);
        if (!res.ok) throw new Error('Failed to fetch expenses');
        const data = await res.json();
        
        if (Array.isArray(data)) {
            processExpenseDataArray(data);
        } else {
            processExpenseDataArray([data]);
        }
        renderTotalOverall();
        renderYearList();
        
        // If there was a selected year, re-render its month list if still exists
        if (selectedYear && groupedData[selectedYear]) {
            renderMonthList();
            // If there was a selected month, re-render its day list
            if (selectedMonth && groupedData[selectedYear].months[selectedMonth]) {
                renderDayList();
            } else {
                clearDayList();
            }
        }
        
    } catch (e) {
        console.error("Failed to load expenses:", e);
        document.getElementById('totalExpenseAmount').innerText = "데이터 로딩 실패";
        document.getElementById('tier-year-list').innerHTML = \`<div class="empty-state"><span class="material-icons">error_outline</span><span>데이터를 불러올 수 없습니다.</span></div>\`;
    }
}

document.addEventListener('DOMContentLoaded', loadExpenseData);

// When user returns to this tab, auto refresh data
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        loadExpenseData();
    }
});

// Also on focus just to be safe
window.addEventListener('focus', loadExpenseData);
`;

const regex = /document\.addEventListener\('DOMContentLoaded',\s*async\s*\(\)\s*=>\s*\{[\s\S]*?\}\);/;
content = content.replace(regex, newContent);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Updated expense_stats.js');
