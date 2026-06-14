import re

def update_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    # Remove the dynamic pagination generation
    pattern = r'if \(isLeft && totalPages > 1\) \{[\s\S]*?\n\s*\}'
    js = re.sub(pattern, '', js)

    # Add a function to update the static pagination
    if 'function updatePaginationUI()' not in js:
        update_func = """
function updatePaginationUI() {
    const prevBtn = document.getElementById('phonebook-prev-btn');
    const nextBtn = document.getElementById('phonebook-next-btn');
    const indicator = document.getElementById('phonebook-page-indicator');

    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages - 1;
    if (indicator) indicator.innerHTML = `<span>${currentPage + 1}</span><span>/</span><span>${totalPages}</span>`;
}
"""
        js += update_func

    # We need to call updatePaginationUI() at the end of renderPhonebookPages or updateDisplay
    js = js.replace('function renderPhonebookPages(page) {', 'function renderPhonebookPages(page) {\n    updatePaginationUI();')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

update_js('Sejong/SejongAttendance/public/phonebook.js')
print("Phonebook JS fixed")
