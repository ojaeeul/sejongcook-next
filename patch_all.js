const fs = require('fs');
let content = fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/attendance_daily.js', 'utf8');

const fetchTarget = `let currentMonthlyStats = {}; // { 'YYYY-MM-DD': presentCount }
let lastFetchedMonth = '';

async function fetchMonthlyAttendanceStats(dateStr) {
    const month = dateStr.substring(0, 7); // 'YYYY-MM'
    if (lastFetchedMonth === month) return; // Already fetched
    
    try {
        const res = await fetch(getFetchUrl('attendance') + \`&month=\${month}\`);
        if (!res.ok) return;
        const logs = await res.json();
        
        currentMonthlyStats = {};
        
        // Calculate total attendance records per day (including absent, late, early, etc.)
        const dailyCount = {}; // { 'YYYY-MM-DD': count }
        const dailySeenMembers = {};
        
        logs.forEach(log => {
            if (!log.status || log.status === 'unchecked') return;
            if (log.status === 'X' || log.status.startsWith('X|')) return;
            
            if (!dailyCount[log.date]) dailyCount[log.date] = 0;
            dailyCount[log.date]++;
        });
        
        for (const [d, count] of Object.entries(dailyCount)) {
            currentMonthlyStats[d] = count;
        }
        
        lastFetchedMonth = month;
        renderMiniCalendar();
    } catch (e) {
        console.error('Failed to fetch monthly stats for calendar', e);
    }
}`;

const fetchReplacement = `let currentMonthlyStats = {}; // { 'YYYY-MM-DD': presentCount }
let lastFetchedMonth = '';
let monthlyLogsCache = [];

window.recalculateMonthlyStats = function() {
    if (!monthlyLogsCache || monthlyLogsCache.length === 0) return;
    
    const includeInactive = document.getElementById('includeInactive') ? document.getElementById('includeInactive').checked : false;
    const statsKeys = ['present', 'absent', 'late', 'early', 'extension', 'entry', 'exit'];
    
    const memberStatusMap = {};
    if (typeof allMembers !== 'undefined') {
        allMembers.forEach(m => {
            memberStatusMap[String(m.id)] = m.status;
        });
    }

    let specificCourseMemberIds = null;
    if (activeCourse && activeCourse !== '전체출석') {
        specificCourseMemberIds = new Set();
        if (typeof allMembers !== 'undefined') {
            allMembers.forEach(m => {
                if (m.course) {
                    const courses = m.course.split(',').map(c => c.trim());
                    if (courses.includes(activeCourse)) {
                        specificCourseMemberIds.add(String(m.id));
                    }
                }
            });
        }
    }

    const dailyCount = {};
    const dailySeenMembers = {};
    
    monthlyLogsCache.forEach(log => {
        if (!log.status || log.status === 'unchecked') return;
        
        const st = log.status.split('|')[0];
        if (!statsKeys.includes(st)) return;
        
        const mId = String(log.memberId);
        
        const mStatus = memberStatusMap[mId];
        if (mStatus === undefined) return; // Deleted from DB
        
        if (!includeInactive) {
            if (mStatus === 'trash' || mStatus === 'completed') return;
        }
        
        if (specificCourseMemberIds !== null) {
            if (!specificCourseMemberIds.has(mId)) return;
        }
        
        if (!dailySeenMembers[log.date]) {
            dailySeenMembers[log.date] = new Set();
            dailyCount[log.date] = 0;
        }
        
        if (!dailySeenMembers[log.date].has(mId)) {
            dailySeenMembers[log.date].add(mId);
            dailyCount[log.date]++;
        }
    });
    
    currentMonthlyStats = {};
    for (const [d, count] of Object.entries(dailyCount)) {
        currentMonthlyStats[d] = count;
    }
    
    renderMiniCalendar();
};

async function fetchMonthlyAttendanceStats(dateStr) {
    const month = dateStr.substring(0, 7); // 'YYYY-MM'
    if (lastFetchedMonth === month) {
        recalculateMonthlyStats();
        return;
    }
    
    try {
        const res = await fetch(getFetchUrl('attendance') + \`&month=\${month}\`);
        if (!res.ok) return;
        const logs = await res.json();
        
        monthlyLogsCache = logs;
        lastFetchedMonth = month;
        
        recalculateMonthlyStats();
    } catch (e) {
        console.error('Failed to fetch monthly stats for calendar', e);
    }
}`;

content = content.replace(fetchTarget, fetchReplacement);

const selectTarget = `    if (!activeCourseHasMembers && selectMobile.options.length > 0) {
        activeCourse = selectMobile.options[0].value;
        selectMobile.options[0].selected = true;
    } else if (selectMobile.options.length === 0) {
        activeCourse = '';
    }
    
    renderAttendanceTbody();
}

window.selectCourseFromMobile = function(val) {
    if (activeCourse !== val) {
        activeCourse = val;
        currentAttendanceState = {};
        currentMemoState = {};
        renderAttendanceTbody();
    }
}`;

const selectReplacement = `    if (!activeCourseHasMembers && selectMobile.options.length > 0) {
        activeCourse = selectMobile.options[0].value;
        selectMobile.options[0].selected = true;
    } else if (selectMobile.options.length === 0) {
        activeCourse = '';
    }
    
    renderAttendanceTbody();
    if (typeof recalculateMonthlyStats === 'function') recalculateMonthlyStats();
}

window.selectCourseFromMobile = function(val) {
    if (activeCourse !== val) {
        activeCourse = val;
        currentAttendanceState = {};
        currentMemoState = {};
        renderAttendanceTbody();
        if (typeof recalculateMonthlyStats === 'function') recalculateMonthlyStats();
    }
}`;

content = content.replace(selectTarget, selectReplacement);

fs.writeFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/attendance_daily.js', content);
