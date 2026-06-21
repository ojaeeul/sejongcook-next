import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I want to inject `getDisplayCourses` inside `renderTable` and replace the course generation part.

# Find renderTable start
render_table_start = "function renderTable(container, title, members, id) {"

if render_table_start not in content:
    print("Could not find renderTable")
    exit(1)

get_display_courses_code = """function renderTable(container, title, members, id) {
    const getDisplayCourses = (mCourseStr) => {
        let baseCourses = (mCourseStr || '').split(',').map(c => c.trim()).filter(c => c && !c.includes('[삭제]'));
        if (activeCategory === '전체') return baseCourses;
        
        if (activeCategory === '기타') {
            const standardList = COURSE_LIST.filter(cl => cl !== '기타');
            return baseCourses.filter(c => !standardList.some(cl => c.includes(cl)));
        }
        
        if (typeof COURSE_LIST !== 'undefined' && COURSE_LIST.includes(activeCategory)) {
            return baseCourses.filter(c => {
                if (activeCategory === '제과기능사' || activeCategory === '제빵기능사') {
                    return c.includes(activeCategory) && !c.includes('제과제빵기능사');
                }
                return c.includes(activeCategory);
            });
        }
        
        if (typeof COURSE_CATEGORIES !== 'undefined' && COURSE_CATEGORIES[activeCategory]) {
            const catCourses = COURSE_CATEGORIES[activeCategory];
            return baseCourses.filter(c => catCourses.some(cat => c.includes(cat)));
        }
        
        return baseCourses;
    };"""

content = content.replace(render_table_start, get_display_courses_code)

old_course_loop = """                    ${(() => {
                        const courses = (m.course || '').split(',').map(c => c.trim());
                        const htmlParts = [];
                        let activeCount = 0;
                        courses.forEach((c, originalIdx) => {"""

new_course_loop = """                    ${(() => {
                        const allCourses = (m.course || '').split(',').map(c => c.trim());
                        const courses = getDisplayCourses(m.course);
                        const htmlParts = [];
                        let activeCount = 0;
                        allCourses.forEach((c, originalIdx) => {
                            if (!courses.includes(c)) return;"""

if old_course_loop in content:
    content = content.replace(old_course_loop, new_course_loop)
    print("Successfully replaced old_course_loop")
else:
    print("Could not find old_course_loop")

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/ledger.js', 'w', encoding='utf-8') as f:
    f.write(content)

