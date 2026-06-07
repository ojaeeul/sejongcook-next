// Just a dummy to structure the code I will inject into ledger.js
window.updateMemberField = async function(memberId, field, value) {
    try {
        const m = membersData.find(m => String(m.id) === String(memberId));
        if (m) m[field] = value;
        await fetch(`/api/sejong/members/${memberId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ [field]: value })
        });
    } catch(e) { console.error(e); }
};

window.updateMemberCourse = async function(memberId, index, value) {
    try {
        const m = membersData.find(m => String(m.id) === String(memberId));
        if (!m) return;
        const courses = (m.course || '').split(',').map(c => c.trim());
        courses[index] = value;
        const newCourse = courses.filter(Boolean).join(',');
        m.course = newCourse;
        await fetch(`/api/sejong/members/${memberId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ course: newCourse })
        });
        // re-render the row if needed, but since it's inline, maybe we don't need to full refresh,
        // but course changes affect attendance and tuition calculations!
        renderLedgerTable(); 
    } catch(e) { console.error(e); }
};

window.moveToTrash = async function(memberId) {
    if(!confirm('정말 휴지통으로 이동하시겠습니까?')) return;
    try {
        const m = membersData.find(m => String(m.id) === String(memberId));
        if (m) m.status = 'trash';
        await fetch(`/api/sejong/members/${memberId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'trash' })
        });
        renderLedgerTable();
    } catch(e) { console.error(e); }
};
