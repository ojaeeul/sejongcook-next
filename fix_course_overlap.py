import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix getDisplayCourses
old_get_display = """
        if (typeof COURSE_LIST !== 'undefined' && COURSE_LIST.includes(activeCategory)) {
            return baseCourses.filter(c => c.includes(activeCategory));
        }
"""
new_get_display = """
        if (typeof COURSE_LIST !== 'undefined' && COURSE_LIST.includes(activeCategory)) {
            return baseCourses.filter(c => {
                if (activeCategory === '제과기능사' || activeCategory === '제빵기능사') {
                    return c.includes(activeCategory) && !c.includes('제과제빵기능사');
                }
                return c.includes(activeCategory);
            });
        }
"""
content = content.replace(old_get_display, new_get_display)

# 2. Fix filteredMembers logic in renderLedger
# We look for the part:
#             return m.course && m.course.includes(courseName);
# inside the filteredMembers = membersData.filter(m => {
#             if (courseName === '기타') { ... }
#             return m.course && m.course.includes(courseName);
#         }).sort(...)

old_filter_logic = """
            if (courseName === '기타') {
                if (!m.course) return true; // Members with no course are '기타'
                const cList = m.course.split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
                if (cList.length === 0) return true;
                return !COURSE_LIST.filter(cl => cl !== '기타').some(cl => cList.some(c => c.includes(cl)));
            }
            return m.course && m.course.includes(courseName);
"""

new_filter_logic = """
            if (courseName === '기타') {
                if (!m.course) return true; // Members with no course are '기타'
                const cList = m.course.split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
                if (cList.length === 0) return true;
                return !COURSE_LIST.filter(cl => cl !== '기타').some(cl => cList.some(c => c.includes(cl)));
            }
            if (!m.course) return false;
            const cList = m.course.split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
            return cList.some(c => {
                if (courseName === '제과기능사' || courseName === '제빵기능사') {
                    return c.includes(courseName) && !c.includes('제과제빵기능사');
                }
                return c.includes(courseName);
            });
"""
content = content.replace(old_filter_logic, new_filter_logic)

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed course overlap logic successfully!")
