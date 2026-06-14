import re

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    # Find the start of 3D animation
    start_str = "    // --- 3D Page Flip Animation ---"
    start_idx = js.find(start_str)
    
    if start_idx == -1:
        return # already removed
        
    # The end of the function is basically "};\n"
    # Find the function end
    end_idx = js.find("};", start_idx) + 2
    
    replacement = """
    // --- Soft Fade Transition ---
    const notebook = document.querySelector('.notebook');
    if (notebook) {
        notebook.style.transition = 'opacity 0.2s ease-out';
        notebook.style.opacity = '0';
        
        setTimeout(() => {
            currentExpensePage += dir;
            if (typeof updateExpensePagination === 'function') {
                updateExpensePagination();
            } else if (typeof updatePhonebookPagination === 'function') {
                updatePhonebookPagination();
            }
            
            notebook.style.transition = 'opacity 0.3s ease-in';
            notebook.style.opacity = '1';
        }, 200);
    } else {
        currentExpensePage += dir;
        if (typeof updateExpensePagination === 'function') {
            updateExpensePagination();
        } else if (typeof updatePhonebookPagination === 'function') {
            updatePhonebookPagination();
        }
    }
};"""

    if filepath.endswith('phonebook.js'):
        replacement = replacement.replace('currentExpensePage', 'currentPage')
        
    js = js[:start_idx] + replacement + js[end_idx:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

update_file('Sejong/SejongAttendance/public/expense_logic.js')
update_file('Sejong/SejongAttendance/public/phonebook.js')
print("Replaced 3D animation with soft fade")
