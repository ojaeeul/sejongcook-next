
function getFetchUrl(endpoint, isPost = false) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let url = '';
    if (isLocal) {
        if (endpoint === 'settings') {
            url = 'http://localhost:8000/api/admin/data/settings';
        } else {
            url = `http://localhost:8000/api/${endpoint}`;
        }
        return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
    } else {
        const base = `../api.php?board=sejong_${endpoint}`;
        return isPost ? base : base + `&t=${Date.now()}`;
    }
}

const membersData = [
  { "id": "1770517017920", "name": "오재을", "course": "양식기능사(17:00)" }
];

let allCourseRows = [];
membersData.forEach(m => {
    const courses = (m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');
    if (courses.length === 0) {
        allCourseRows.push({ member: m, courseFull: '', courseName: '' });
    } else {
        courses.forEach(courseFull => {
            let courseName = courseFull.replace(/\([^)]*\)/g, '').trim();
            allCourseRows.push({ member: m, courseFull: courseFull, courseName: courseName });
        });
    }
});

console.log("allCourseRows:", allCourseRows);

// The increment calculation:
allCourseRows.forEach(rowData => {
    const rowCourseNameScope = rowData.courseName;
    const isDualCourse = rowCourseNameScope && rowCourseNameScope.includes('제과제빵');
    const attendanceIncrement = isDualCourse ? 0.5 : 1;
    console.log(`Course: ${rowCourseNameScope}, isDualCourse: ${isDualCourse}, increment: ${attendanceIncrement}`);
});
