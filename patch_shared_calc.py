import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I need to add `simulatedAttendances: []` to the function
# Around line 292:
#     let isSimulated = false;
#     const hasRealMilestonesThisMonth = redBoxDates.size > 0;
# We will add: `let simulatedAttendances = [];`
# Then inside `if (isValidDay && !isHoliday) {` we will push to it.

if "let simulatedAttendances = [];" not in content:
    content = content.replace("let isSimulated = false;", "let isSimulated = false;\\n    let simulatedAttendances = [];")

# Around line 365:
#             if (isValidDay && !isHoliday) {
#                 const prevSimCycle = getCycle(simTotal);
#                 simTotal += attendanceIncrement;

old_valid_day = """            if (isValidDay && !isHoliday) {
                const prevSimCycle = getCycle(simTotal);
                simTotal += attendanceIncrement;"""

new_valid_day = """            if (isValidDay && !isHoliday) {
                simulatedAttendances.push({
                    year: simDate.getFullYear(),
                    month: simDate.getMonth() + 1,
                    day: simDate.getDate()
                });
                const prevSimCycle = getCycle(simTotal);
                simTotal += attendanceIncrement;"""

if old_valid_day in content:
    content = content.replace(old_valid_day, new_valid_day)
    print("Replaced old_valid_day successfully.")
else:
    print("Could not find old_valid_day.")

# Return object replacement
old_return = """    return {
        redDays: actualRedDays,
        pureRedDays: pureRedDaysList,
        hasAnyAttendance: hasAnyAttendance,
        isSimulated: isSimulated,
        allMilestones: allMilestones,
        scheduledDate: finalScheduledDate,
        currentCount: { count: carryOverP, target: window.getCourseCycleLength(courseFilter || String(member.course), member.type) }
    };"""

new_return = """    return {
        redDays: actualRedDays,
        pureRedDays: pureRedDaysList,
        hasAnyAttendance: hasAnyAttendance,
        isSimulated: isSimulated,
        simulatedAttendances: simulatedAttendances,
        allMilestones: allMilestones,
        scheduledDate: finalScheduledDate,
        currentCount: { count: carryOverP, target: window.getCourseCycleLength(courseFilter || String(member.course), member.type) }
    };"""

if old_return in content:
    content = content.replace(old_return, new_return)
    print("Replaced old_return successfully.")
else:
    print("Could not find old_return.")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js', 'w', encoding='utf-8') as f:
    f.write(content)

