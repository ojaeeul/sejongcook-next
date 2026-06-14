import re

with open("Sejong/SejongAttendance/public/phonebook.js", "r", encoding="utf-8") as f:
    content = f.read()

# We need to add `onclick="showCourseOverlay('${coursesStr}')"` to `.course-badge-list`
content = content.replace(
    '''<div class="course-badge-list" style="width: 160px; display: flex; align-items: center; justify-content: flex-start; padding: 0 10px; gap: 4px; flex-wrap: wrap; margin-left: auto;">''',
    '''<div class="course-badge-list" style="width: 160px; display: flex; align-items: center; justify-content: flex-start; padding: 0 10px; gap: 4px; flex-wrap: wrap; margin-left: auto; cursor: pointer;" onclick="showCourseOverlay(this, '${m.name}', '${coursesStr}')" title="크게 보기">'''
)

# And inject the function at the end of the file
overlay_fn = """
function showCourseOverlay(element, studentName, coursesStr) {
    if (!coursesStr) return;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';
    overlay.style.backdropFilter = 'blur(2px)';
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '30px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
    modal.style.maxWidth = '80%';
    modal.style.minWidth = '300px';
    modal.style.textAlign = 'center';
    modal.style.transform = 'scale(0.9)';
    modal.style.transition = 'transform 0.2s ease-out';
    
    // Title
    const title = document.createElement('h3');
    title.style.margin = '0 0 20px 0';
    title.style.color = '#1e293b';
    title.style.fontSize = '1.2rem';
    title.textContent = studentName + ' 수강 과정';
    modal.appendChild(title);
    
    // Badges container
    const badgeContainer = document.createElement('div');
    badgeContainer.style.display = 'flex';
    badgeContainer.style.flexWrap = 'wrap';
    badgeContainer.style.justifyContent = 'center';
    badgeContainer.style.gap = '10px';
    
    const courses = coursesStr.split(',');
    courses.forEach(c => {
        const badge = document.createElement('div');
        badge.style.fontSize = '1.1rem';
        badge.style.color = '#3b82f6';
        badge.style.background = '#eff6ff';
        badge.style.border = '1px solid #bfdbfe';
        badge.style.padding = '10px 16px';
        badge.style.borderRadius = '20px';
        badge.style.fontWeight = '600';
        badge.style.display = 'flex';
        badge.style.alignItems = 'center';
        badge.style.gap = '6px';
        
        const icon = document.createElement('i');
        icon.className = 'material-icons';
        icon.style.fontSize = '1.2rem';
        icon.textContent = 'menu_book';
        
        badge.appendChild(icon);
        badge.appendChild(document.createTextNode(c.trim()));
        badgeContainer.appendChild(badge);
    });
    
    modal.appendChild(badgeContainer);
    
    // Close instruction
    const hint = document.createElement('div');
    hint.style.marginTop = '20px';
    hint.style.fontSize = '0.85rem';
    hint.style.color = '#94a3b8';
    hint.textContent = '화면을 터치하면 닫힙니다.';
    modal.appendChild(hint);
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Animate pop
    requestAnimationFrame(() => {
        modal.style.transform = 'scale(1)';
    });
    
    // Close on click
    overlay.addEventListener('click', () => {
        modal.style.transform = 'scale(0.9)';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.2s ease';
        setTimeout(() => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        }, 200);
    });
}
"""

if "function showCourseOverlay" not in content:
    content += "\n" + overlay_fn

with open("Sejong/SejongAttendance/public/phonebook.js", "w", encoding="utf-8") as f:
    f.write(content)

print("phonebook.js updated.")
