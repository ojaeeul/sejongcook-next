const fs = require('fs');
let content = fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/attendance_daily.js', 'utf8');

const target = `    const dailyCount = {};
    
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
        
        if (!dailyCount[log.date]) dailyCount[log.date] = 0;
        dailyCount[log.date]++;
    });`;

const replacement = `    const dailyCount = {};
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
    });`;

content = content.replace(target, replacement);

fs.writeFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/attendance_daily.js', content);
