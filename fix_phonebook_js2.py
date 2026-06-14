import re

def update_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    old_func = """function updatePaginationUI() {
    const prevBtn = document.getElementById('phonebook-prev-btn');
    const nextBtn = document.getElementById('phonebook-next-btn');
    const indicator = document.getElementById('phonebook-page-indicator');

    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages - 1;
    if (indicator) indicator.innerHTML = `<span>${currentPage + 1}</span><span>/</span><span>${totalPages}</span>`;
}"""

    new_func = """function updatePaginationUI() {
    const controls = document.querySelector('.pagination-controls');
    const prevBtn = document.getElementById('phonebook-prev-btn');
    const nextBtn = document.getElementById('phonebook-next-btn');
    const indicator = document.getElementById('phonebook-page-indicator');

    if (totalPages > 1) {
        if (controls) controls.style.display = 'flex';
        if (prevBtn) prevBtn.disabled = currentPage === 0;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages - 1;
        if (indicator) indicator.innerHTML = `<span>${currentPage + 1}</span><span>/</span><span>${totalPages}</span>`;
    } else {
        if (controls) controls.style.display = 'none';
    }
}"""
    
    if old_func in js:
        js = js.replace(old_func, new_func)
    else:
        print("old_func not found!")
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

update_js('Sejong/SejongAttendance/public/phonebook.js')
print("Phonebook JS display fixed")
