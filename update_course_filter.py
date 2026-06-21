import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Define the helper function logic inside generateMonthTableHTML
helper_func = """
    const getDisplayCourses = (mCourseStr) => {
        let baseCourses = (mCourseStr || '').split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
        if (activeCategory === '전체') return baseCourses;
        
        if (activeCategory === '기타') {
            const standardList = COURSE_LIST.filter(cl => cl !== '기타');
            return baseCourses.filter(c => !standardList.some(cl => c.includes(cl)));
        }
        
        if (typeof COURSE_LIST !== 'undefined' && COURSE_LIST.includes(activeCategory)) {
            return baseCourses.filter(c => c.includes(activeCategory));
        }
        
        if (typeof COURSE_CATEGORIES !== 'undefined' && COURSE_CATEGORIES[activeCategory]) {
            const catCourses = COURSE_CATEGORIES[activeCategory];
            return baseCourses.filter(c => catCourses.some(cat => c.includes(cat)));
        }
        
        return baseCourses;
    };
"""

# Inject it at the start of generateMonthTableHTML
start_marker = "function generateMonthTableHTML(title, members, id, tYear, tMonth) {"
content = content.replace(start_marker, start_marker + helper_func)

# Replace the first `const courses = ...`
old_courses = "const courses = (m.course || '').split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));"
new_courses = "const courses = getDisplayCourses(m.course);"
content = content.replace(old_courses, new_courses)

# Replace the `const activeCourses = ...`
old_active_courses = "const activeCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));"
new_active_courses = "const activeCourses = getDisplayCourses(m.course);"
content = content.replace(old_active_courses, new_active_courses)

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger_expected.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated course filtering logic successfully!")
