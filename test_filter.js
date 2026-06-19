const adminMembers = [
    { name: "홍길동", phone: "010-1234-5678", course: "한식기능사" },
    { name: "김철수", phone: "010-0000-0000", course: "양식기능사, 중식기능사" }
];

const searchTerm = "홍";
const courseFilter = "ALL";

const filtered = adminMembers.filter(m => {
    const matchName = (m.name || '').toLowerCase().includes(searchTerm) || (m.phone || '').includes(searchTerm);
    if(!matchName) return false;
    
    if(courseFilter !== 'ALL') {
        if(!m.course) return false;
        const cList = m.course.split(',').map(c => c.trim().replace(/\([^)]*\)/g, '').trim()).filter(c=>c);
        if(!cList.includes(courseFilter)) return false;
    }
    return true;
});

console.log("Filtered result:", filtered);
