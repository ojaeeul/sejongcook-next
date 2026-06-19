const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/kiosk_admin.js';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `    const filtered = adminMembers.filter(m => {
        const matchName = (m.name || '').toLowerCase().includes(searchTerm) || (m.phone || '').includes(searchTerm);
        if(!matchName) return false;
        
        if(courseFilter !== 'ALL') {
            if(!m.course) return false;
            const cList = m.course.split(',').map(c => c.trim().replace(/\\([^)]*\\)/g, '').trim()).filter(c=>c);
            if(!cList.includes(courseFilter)) return false;
        }
        return true;
    });`;

const newStr = `    const filtered = adminMembers.filter(m => {
        const nameStr = String(m.name || '').toLowerCase();
        const phoneStr = String(m.phone || '');
        const matchName = nameStr.includes(searchTerm) || phoneStr.includes(searchTerm);
        if(!matchName) return false;
        
        if(courseFilter !== 'ALL') {
            if(!m.course) return false;
            const courseStr = String(m.course);
            const cList = courseStr.split(',').map(c => c.trim().replace(/\\([^)]*\\)/g, '').trim()).filter(c=>c);
            if(!cList.includes(courseFilter)) return false;
        }
        return true;
    });`;

content = content.replace(targetStr, newStr);

// Also add trim to searchTerm
content = content.replace(
    `const searchTerm = document.getElementById('searchInput').value.toLowerCase();`,
    `const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Made filter robust!');
