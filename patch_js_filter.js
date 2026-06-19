const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/kiosk_admin.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add populateCourseFilter
const renderListStr = 'function renderList() {';
const populateFunc = `function populateCourseFilter() {
    const courseSet = new Set();
    adminMembers.forEach(m => {
        if(m.course) {
            const cList = m.course.split(',').map(c => c.trim().replace(/\\([^)]*\\)/g, '').trim()).filter(c=>c);
            cList.forEach(c => courseSet.add(c));
        }
    });
    const select = document.getElementById('courseFilter');
    if(!select) return;
    const currentVal = select.value;
    select.innerHTML = '<option value="ALL">전체보기 (과정 선택)</option>';
    Array.from(courseSet).sort().forEach(c => {
        const opt = document.createElement('option');
        opt.value = c;
        opt.textContent = c;
        select.appendChild(opt);
    });
    select.value = currentVal || 'ALL';
}

function renderList() {`;
content = content.replace(renderListStr, populateFunc);

// 2. Call populateCourseFilter in fetchMembers
const fetchMembersStr = `        todayAttendance = Array.isArray(rawAtt) ? rawAtt.filter(a => a.date === today && a.status !== 'unchecked') : [];
        
        renderList();`;
const newFetchMembersStr = `        todayAttendance = Array.isArray(rawAtt) ? rawAtt.filter(a => a.date === today && a.status !== 'unchecked') : [];
        
        populateCourseFilter();
        renderList();`;
content = content.replace(fetchMembersStr, newFetchMembersStr);

// 3. Update filterList inside renderList
const filterBlockStr = `    const filtered = adminMembers.filter(m => {
        return (m.name || '').toLowerCase().includes(searchTerm) || (m.phone || '').includes(searchTerm);
    });`;

const newFilterBlockStr = `    const courseFilter = document.getElementById('courseFilter') ? document.getElementById('courseFilter').value : 'ALL';
    
    const filtered = adminMembers.filter(m => {
        const matchName = (m.name || '').toLowerCase().includes(searchTerm) || (m.phone || '').includes(searchTerm);
        if(!matchName) return false;
        
        if(courseFilter !== 'ALL') {
            if(!m.course) return false;
            const cList = m.course.split(',').map(c => c.trim().replace(/\\([^)]*\\)/g, '').trim()).filter(c=>c);
            if(!cList.includes(courseFilter)) return false;
        }
        return true;
    });`;

content = content.replace(filterBlockStr, newFilterBlockStr);

fs.writeFileSync(file, content, 'utf8');
console.log('Patched kiosk_admin.js with filter!');
