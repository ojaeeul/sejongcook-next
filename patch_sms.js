const fs = require('fs');
const file = 'public/sejong/sms_v3.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Initializers
content = content.replace(
    /let calendarYear = new Date\(\)\.getFullYear\(\);\nlet calendarMonth = new Date\(\)\.getMonth\(\);/,
    `let calendarYear = localStorage.getItem('sejongSmsCalYear') ? parseInt(localStorage.getItem('sejongSmsCalYear')) : new Date().getFullYear();
let calendarMonth = localStorage.getItem('sejongSmsCalMonth') ? parseInt(localStorage.getItem('sejongSmsCalMonth')) : new Date().getMonth();`
);

// 2. changeRangeMonth
content = content.replace(
    /function changeRangeMonth\(offset\) {[\s\S]*?renderRangeCalendar\(\);\n}/,
    `function changeRangeMonth(offset) {
    calendarMonth += offset;
    if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
    if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
    localStorage.setItem('sejongSmsCalYear', calendarYear);
    localStorage.setItem('sejongSmsCalMonth', calendarMonth);
    renderRangeCalendar();
}`
);

// 3. setQuickRange
content = content.replace(
    /calendarYear = start\.getFullYear\(\);\n\s*calendarMonth = start\.getMonth\(\);/,
    `calendarYear = start.getFullYear();
    calendarMonth = start.getMonth();
    localStorage.setItem('sejongSmsCalYear', calendarYear);
    localStorage.setItem('sejongSmsCalMonth', calendarMonth);`
);

// 4. renderRangeCalendar
const oldRenderCal = `    // Pre-calculate payment days for highlighting
    const paymentDays = new Set();
    allMembers.forEach(m => {
        let myCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');
        const hasJeggwa = myCourses.some(c => c.includes('제과') && !c.includes('제과제빵'));
        const hasJeppang = myCourses.some(c => c.includes('제빵') && !c.includes('제과제빵'));
        if (hasJeggwa && hasJeppang) {
            myCourses = myCourses.filter(c => !c.includes('제과') && !c.includes('제빵'));
            myCourses.push('제과제빵기능사');
        }
        myCourses.forEach(c => {
            const milestones = getAllMilestonesForMonth(m.id, c.trim(), calendarYear, calendarMonth + 1);
            milestones.forEach(ms => paymentDays.add(ms.day));
        });
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Padding prev month
    for (let i = firstDay; i > 0; i--) {
        const d = document.createElement('div');
        d.className = 'calendar-day other-month';
        d.textContent = prevLastDate - i + 1;
        grid.appendChild(d);
    }

    // Current month days
    for (let i = 1; i <= lastDate; i++) {
        const d = document.createElement('div');
        const currentD = new Date(calendarYear, calendarMonth, i);
        currentD.setHours(0, 0, 0, 0);

        d.className = 'calendar-day';
        d.textContent = i;

        const dayOfWeek = currentD.getDay();
        const y_cal = currentD.getFullYear();
        const m_cal = String(currentD.getMonth() + 1).padStart(2, '0');
        const d_cal = String(currentD.getDate()).padStart(2, '0');
        const dateStr = \`\${y_cal}-\${m_cal}-\${d_cal}\`;
        const isHolidayInSys = holidaysData.some(h => h.date === dateStr);
        const isNationalHoliday = !!KOREAN_HOLIDAYS_MAP[dateStr];

        // Color rules: Sun/Holiday Red, Sat Blue, Others Black
        if (dayOfWeek === 0 || isHolidayInSys || isNationalHoliday) {
            d.style.color = '#ef4444';
        } else if (dayOfWeek === 6) {
            d.style.color = '#3b82f6';
        }

        if (currentD.getTime() === today.getTime()) {
            d.classList.add('today');
        }

        // Highlight selected range
        if (startDate && endDate) {
            if (currentD.getTime() >= startDate.getTime() && currentD.getTime() <= endDate.getTime()) {
                d.classList.add('in-range');
            }
            if (currentD.getTime() === startDate.getTime()) {
                d.classList.add('range-start');
                d.classList.remove('in-range');
            }
            if (currentD.getTime() === endDate.getTime()) {
                d.classList.add('range-end');
                d.classList.remove('in-range');
            }
        }

        // Highlight payment milestones
        if (paymentDays.has(i)) {
            d.style.position = 'relative';
            const dot = document.createElement('div');
            dot.style.position = 'absolute';
            dot.style.bottom = '4px';
            dot.style.left = '50%';
            dot.style.transform = 'translateX(-50%)';
            dot.style.width = '6px';
            dot.style.height = '6px';
            dot.style.background = '#ef4444';
            dot.style.borderRadius = '50%';
            d.appendChild(dot);
        }`;

const newRenderCal = `    // Pre-calculate payment days for highlighting WITH NAMES
    const paymentNamesByDay = {}; // e.g. { 12: ['홍길동 (제과)', '김철수 (제빵)'] }
    allMembers.forEach(m => {
        let myCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');
        const hasJeggwa = myCourses.some(c => c.includes('제과') && !c.includes('제과제빵'));
        const hasJeppang = myCourses.some(c => c.includes('제빵') && !c.includes('제과제빵'));
        if (hasJeggwa && hasJeppang) {
            myCourses = myCourses.filter(c => !c.includes('제과') && !c.includes('제빵'));
            myCourses.push('제과제빵기능사');
        }
        myCourses.forEach(c => {
            const milestones = getAllMilestonesForMonth(m.id, c.trim(), calendarYear, calendarMonth + 1);
            milestones.forEach(ms => {
                if (!paymentNamesByDay[ms.day]) paymentNamesByDay[ms.day] = [];
                const cClean = c.trim().replace('기능사', '');
                const label = \`\${m.name}(\${cClean})\`;
                if (!paymentNamesByDay[ms.day].includes(label)) {
                    paymentNamesByDay[ms.day].push(label);
                }
            });
        });
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Padding prev month
    for (let i = firstDay; i > 0; i--) {
        const d = document.createElement('div');
        d.className = 'calendar-day other-month';
        d.textContent = prevLastDate - i + 1;
        grid.appendChild(d);
    }

    // Current month days
    for (let i = 1; i <= lastDate; i++) {
        const d = document.createElement('div');
        const currentD = new Date(calendarYear, calendarMonth, i);
        currentD.setHours(0, 0, 0, 0);

        d.className = 'calendar-day';
        d.textContent = i;

        const dayOfWeek = currentD.getDay();
        const y_cal = currentD.getFullYear();
        const m_cal = String(currentD.getMonth() + 1).padStart(2, '0');
        const d_cal = String(currentD.getDate()).padStart(2, '0');
        const dateStr = \`\${y_cal}-\${m_cal}-\${d_cal}\`;
        const isHolidayInSys = holidaysData.some(h => h.date === dateStr);
        const isNationalHoliday = !!KOREAN_HOLIDAYS_MAP[dateStr];

        // Color rules: Sun/Holiday Red, Sat Blue, Others Black
        if (dayOfWeek === 0 || isHolidayInSys || isNationalHoliday) {
            d.style.color = '#ef4444';
        } else if (dayOfWeek === 6) {
            d.style.color = '#3b82f6';
        }

        if (currentD.getTime() === today.getTime()) {
            d.classList.add('today');
        }

        // Highlight selected range
        if (startDate && endDate) {
            if (currentD.getTime() >= startDate.getTime() && currentD.getTime() <= endDate.getTime()) {
                d.classList.add('in-range');
            }
            if (currentD.getTime() === startDate.getTime()) {
                d.classList.add('range-start');
                d.classList.remove('in-range');
            }
            if (currentD.getTime() === endDate.getTime()) {
                d.classList.add('range-end');
                d.classList.remove('in-range');
            }
        }

        // Highlight payment milestones with NAMES
        if (paymentNamesByDay[i] && paymentNamesByDay[i].length > 0) {
            const badgeContainer = document.createElement('div');
            badgeContainer.style.cssText = "display: flex; flex-direction: column; gap: 2px; margin-top: 4px; overflow: hidden; width: 100%; align-items: center;";
            paymentNamesByDay[i].forEach(label => {
                const nameBadge = document.createElement('div');
                nameBadge.textContent = label;
                // Add title for full text on hover
                nameBadge.title = label;
                nameBadge.style.cssText = "font-size: 0.55rem; background: #fee2e2; color: #ef4444; padding: 1px 4px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 95%; text-align: center;";
                badgeContainer.appendChild(nameBadge);
            });
            d.appendChild(badgeContainer);
        }`;

content = content.replace(oldRenderCal, newRenderCal);
fs.writeFileSync(file, content, 'utf8');
console.log('Patch complete.');
