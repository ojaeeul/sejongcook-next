import os

base_dir = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
js_files = ["exam.js", "practical_exam.js"]

for js_file in js_files:
    file_path = os.path.join(base_dir, js_file)
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Update showStatusDropdown
    old_show = """function showStatusDropdown(input, index) {
    const dropdown = document.getElementById(`status-dropdown-${index}`);
    if (!dropdown) return;
    dropdown.style.display = 'block';
    populateStatusDropdown(input.value.trim(), index);
}"""
    
    new_show = """function showStatusDropdown(input, index) {
    const dropdown = document.getElementById(`status-dropdown-${index}`);
    if (!dropdown) return;
    dropdown.style.display = 'block';
    if (dropdown.parentElement) dropdown.parentElement.style.zIndex = '1000';
    populateStatusDropdown(input.value.trim(), index);
}"""

    # Update hideStatusDropdown
    old_hide = """function hideStatusDropdown(index) {
    setTimeout(() => {
        const dropdown = document.getElementById(`status-dropdown-${index}`);
        if (dropdown) dropdown.style.display = 'none';
    }, 200);
}"""

    new_hide = """function hideStatusDropdown(index) {
    setTimeout(() => {
        const dropdown = document.getElementById(`status-dropdown-${index}`);
        if (dropdown) {
            dropdown.style.display = 'none';
            if (dropdown.parentElement) dropdown.parentElement.style.zIndex = '10';
        }
    }, 200);
}"""

    if old_show in content:
        content = content.replace(old_show, new_show)
        content = content.replace(old_hide, new_hide)
        
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Fixed z-index in {js_file}")
    else:
        print(f"Could not find exact function block in {js_file}")

print("Done.")
