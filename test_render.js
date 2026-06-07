const { JSDOM } = require("jsdom");
const dom = new JSDOM(`<!DOCTYPE html><html><body>
<div id="calendarGrid"></div>
<input type="checkbox" id="usePaymentFilter">
</body></html>`);
global.document = dom.window.document;
global.window = dom.window;

// Mock data
global.allMembers = [
    { id: 1, name: "홍길동", course: "제과기능사", status: "active", phone: "010-1111-2222" },
    { id: 2, name: "김철수", course: "제빵기능사", status: "active", phone: "010-3333-4444" }
];
let calendarYear = 2026;
let calendarMonth = 5; // June
let isDragging = false;
let dragStartDay = null;

// Mock function
global.getMemberAllMilestones = function(id, course, y, m) {
    if (id === 1) return [{ year: 2026, month: 6, day: 15 }];
    if (id === 2) return [{ year: 2026, month: 6, day: 15 }, { year: 2026, month: 6, day: 17 }];
    return [];
};

function renderRangeCalendar() {
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';
    
    const paymentNamesByDay = {};
    allMembers.forEach(m => {
        let myCourses = String(m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');
        myCourses.forEach(c => {
            const milestones = global.getMemberAllMilestones(m.id, c.trim(), calendarYear, calendarMonth + 1).filter(ms => ms.year === calendarYear && ms.month === calendarMonth + 1);
            milestones.forEach(ms => {
                if (!paymentNamesByDay[ms.day]) paymentNamesByDay[ms.day] = [];
                const cClean = c.trim().replace('기능사', '');
                const label = `${m.name}(${cClean})`;
                if (!paymentNamesByDay[ms.day].includes(label)) {
                    paymentNamesByDay[ms.day].push(label);
                }
            });
        });
    });
    
    console.log("paymentNamesByDay:", paymentNamesByDay);
    
    for (let i = 1; i <= 30; i++) {
        const d = document.createElement('div');
        d.className = 'calendar-day';
        d.textContent = i;
        
        if (paymentNamesByDay[i] && paymentNamesByDay[i].length > 0) {
            d.style.fontWeight = '900';
            d.style.color = '#ef4444';
            
            const nameList = paymentNamesByDay[i].map(n => n.split('(')[0]).join(','); 
            const indicator = document.createElement('div');
            indicator.style.fontSize = '0.65rem';
            indicator.textContent = paymentNamesByDay[i].length > 2 ? `${paymentNamesByDay[i].length}명결제` : nameList;
            d.appendChild(indicator);
            console.log(`Day ${i} generated:`, d.outerHTML);
        }
        
        d.onmousedown = (e) => { e.preventDefault(); startDrag(new Date(calendarYear, calendarMonth, i)); };
        d.onmouseenter = (e) => { if(isDragging) updateDrag(new Date(calendarYear, calendarMonth, i)); };
        d.onmouseup = (e) => { endDrag(new Date(calendarYear, calendarMonth, i)); };
        
        grid.appendChild(d);
    }
}

function startDrag(d) { console.log("startDrag", d); isDragging = true; dragStartDay = d; }
function updateDrag(d) { console.log("updateDrag", d); }
function endDrag(d) { console.log("endDrag", d); isDragging = false; }

renderRangeCalendar();

// Simulate drag
console.log("Simulating drag...");
const days = document.querySelectorAll('.calendar-day');
days[14].onmousedown(new dom.window.MouseEvent('mousedown')); // Day 15
days[15].onmouseenter(new dom.window.MouseEvent('mouseenter')); // Day 16
days[16].onmouseup(new dom.window.MouseEvent('mouseup')); // Day 17

console.log("Finished successfully");
