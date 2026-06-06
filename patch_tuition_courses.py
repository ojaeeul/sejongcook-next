import re

with open("public/sejong/tuition_v3.js", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update lines 440 (renderTable total view)
old_line440 = """        let myCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');"""
new_line440 = """        let myCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');
        const hasJeggwa = myCourses.some(c => c.includes('제과') && !c.includes('제과제빵'));
        const hasJeppang = myCourses.some(c => c.includes('제빵') && !c.includes('제과제빵'));
        if (hasJeggwa && hasJeppang) {
            myCourses = myCourses.filter(c => !c.includes('제과') && !c.includes('제빵'));
            myCourses.push('제과제빵기능사');
        }"""
if old_line440 in content:
    content = content.replace(old_line440, new_line440)
    print("Patched renderTable myCourses")
else:
    print("Could not find old_line440")

# 2. Update line 942 (renderGroupedCards)
old_line942 = """        let myCourses = (m.course || '').split(',').map(c => c.trim()).filter(c => c !== '');"""
if old_line942 in content:
    content = content.replace(old_line942, new_line440)
    print("Patched renderGroupedCards myCourses")
else:
    print("Could not find old_line942")

# 3. cleanCourseName for UI display
old_clean = """function cleanCourseName(courseStr) {
    if (!courseStr) return '';
    return courseStr.split(',').map(s => s.split('(')[0].trim()).join(', ');
}"""
new_clean = """function cleanCourseName(courseStr) {
    if (!courseStr) return '';
    let cs = courseStr.split(',').map(s => s.split('(')[0].trim());
    const hjg = cs.some(c => c.includes('제과') && !c.includes('제과제빵'));
    const hjp = cs.some(c => c.includes('제빵') && !c.includes('제과제빵'));
    if (hjg && hjp) {
        cs = cs.filter(c => !c.includes('제과') && !c.includes('제빵'));
        cs.push('제과제빵기능사');
    }
    return cs.join(', ');
}"""
if old_clean in content:
    content = content.replace(old_clean, new_clean)
    print("Patched cleanCourseName")
else:
    print("Could not find cleanCourseName")

# 4. calculateTotalFee 
old_calc = """function calculateTotalFee(courseStr) {
    if (!courseStr) return courseFees['all'] || DEFAULT_PRICE;
    const courses = courseStr.split(',').map(s => s.split('(')[0].trim());"""
new_calc = """function calculateTotalFee(courseStr) {
    if (!courseStr) return courseFees['all'] || DEFAULT_PRICE;
    let courses = courseStr.split(',').map(s => s.split('(')[0].trim());
    const hjg = courses.some(c => c.includes('제과') && !c.includes('제과제빵'));
    const hjp = courses.some(c => c.includes('제빵') && !c.includes('제과제빵'));
    if (hjg && hjp) {
        courses = courses.filter(c => !c.includes('제과') && !c.includes('제빵'));
        courses.push('제과제빵기능사');
    }"""
if old_calc in content:
    content = content.replace(old_calc, new_calc)
    print("Patched calculateTotalFee")
else:
    print("Could not find calculateTotalFee")

with open("public/sejong/tuition_v3.js", "w", encoding="utf-8") as f:
    f.write(content)
