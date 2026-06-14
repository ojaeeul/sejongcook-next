import re

with open("Sejong/SejongAttendance/public/expense_logic.js", "r", encoding="utf-8") as f:
    js = f.read()

# Make sure updateExpensePagination and changeExpensePage are not already there
if "function updateExpensePagination" not in js and "function changeExpensePage" not in js:
    missing_js = """
// --- Expense Pagination Logic ---
let currentExpensePage = 0;
const LINES_PER_PAGE = 32;

function updateExpensePagination() {
    const expenseContainer = document.getElementById('expense-container');
    const cookingContainer = document.getElementById('sales-cooking-container');
    const bakingContainer = document.getElementById('sales-baking-container');
    
    // Check if pagination should be enabled
    if (!expenseContainer) return;
    
    const lines = expenseContainer.querySelectorAll('.entry-line');
    const totalLines = lines.length;
    const totalPages = Math.max(1, Math.ceil(totalLines / LINES_PER_PAGE));
    
    // Ensure current page is valid
    if (currentExpensePage >= totalPages) currentExpensePage = totalPages - 1;
    if (currentExpensePage < 0) currentExpensePage = 0;
    
    const startIdx = currentExpensePage * LINES_PER_PAGE;
    const endIdx = startIdx + LINES_PER_PAGE;
    
    // Update Expense List
    lines.forEach((line, index) => {
        if (index >= startIdx && index < endIdx) {
            line.classList.remove('hidden-page-line');
        } else {
            line.classList.add('hidden-page-line');
        }
    });
    
    // Update Sales Cooking List
    if (cookingContainer) {
        cookingContainer.querySelectorAll('.entry-line').forEach((line, index) => {
            if (index >= startIdx && index < endIdx) {
                line.classList.remove('hidden-page-line');
            } else {
                line.classList.add('hidden-page-line');
            }
        });
    }
    
    // Update Sales Baking List
    if (bakingContainer) {
        bakingContainer.querySelectorAll('.entry-line').forEach((line, index) => {
            if (index >= startIdx && index < endIdx) {
                line.classList.remove('hidden-page-line');
            } else {
                line.classList.add('hidden-page-line');
            }
        });
    }
    
    // Update Indicator & Buttons
    const indicator = document.getElementById('expense-page-indicator');
    const prevBtn = document.getElementById('expense-prev-btn');
    const nextBtn = document.getElementById('expense-next-btn');
    
    if (indicator) indicator.textContent = `${currentExpensePage + 1} / ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentExpensePage === 0;
    if (nextBtn) nextBtn.disabled = currentExpensePage >= totalPages - 1;
}

window.changeExpensePage = function(dir) {
    const expenseContainer = document.getElementById('expense-container');
    if (!expenseContainer) return;
    
    const totalLines = expenseContainer.querySelectorAll('.entry-line').length;
    const totalPages = Math.ceil(totalLines / LINES_PER_PAGE);
    
    if (currentExpensePage + dir < 0 || currentExpensePage + dir >= totalPages) return;

    // --- 3D Page Flip Animation ---
    const wrapper = document.querySelector('.notebook-wrapper');
    const pageRight = document.querySelector('.page-right');
    const pageLeft = document.querySelector('.page-left');
    
    if (!wrapper || !pageRight || !pageLeft) {
        // Fallback without animation
        currentExpensePage += dir;
        updateExpensePagination();
        return;
    }

    const oldPageHTMLRight = pageRight.innerHTML;
    const oldPageHTMLLeft = pageLeft.innerHTML;
    
    currentExpensePage += dir;
    updateExpensePagination();
    
    const newPageHTMLRight = pageRight.innerHTML;
    const newPageHTMLLeft = pageLeft.innerHTML;
    
    // Restore DOM temporarily for animation start
    currentExpensePage -= dir;
    updateExpensePagination();
    
    const flipContainer = document.createElement('div');
    flipContainer.className = 'flip-page-container';
    
    const front = document.createElement('div');
    front.className = 'flip-page-front page page-right';
    
    const back = document.createElement('div');
    back.className = 'flip-page-back page page-left';
    
    const staticUnderlay = document.createElement('div');
    staticUnderlay.className = 'flip-page-underlay page';
    
    if (dir > 0) {
        front.innerHTML = oldPageHTMLRight;
        back.innerHTML = newPageHTMLLeft;
        
        staticUnderlay.style.left = '0';
        staticUnderlay.classList.add('page-left');
        staticUnderlay.innerHTML = oldPageHTMLLeft;
        
        flipContainer.style.transformOrigin = 'left center';
        flipContainer.style.right = '0';
        flipContainer.style.transform = 'perspective(2000px) rotateY(0deg)';
        
    } else {
        front.innerHTML = oldPageHTMLLeft;
        back.innerHTML = newPageHTMLRight;
        
        staticUnderlay.style.right = '0';
        staticUnderlay.classList.add('page-right');
        staticUnderlay.innerHTML = oldPageHTMLRight;
        
        flipContainer.style.transformOrigin = 'right center';
        flipContainer.style.left = '0';
        flipContainer.style.transform = 'perspective(2000px) rotateY(0deg)';
    }
    
    flipContainer.appendChild(front);
    flipContainer.appendChild(back);
    
    wrapper.appendChild(staticUnderlay);
    wrapper.appendChild(flipContainer);
    
    setTimeout(() => {
        flipContainer.classList.add('flip');
        if (dir > 0) {
            flipContainer.style.transform = 'perspective(2000px) rotateY(-180deg)';
        } else {
            flipContainer.style.transform = 'perspective(2000px) rotateY(180deg)';
        }
        
        // Actually apply the new page after the flip starts to the main background
        currentExpensePage += dir;
        updateExpensePagination();
        
    }, 50);
    
    setTimeout(() => {
        flipContainer.remove();
        staticUnderlay.remove();
    }, 600);
};
"""
    with open("Sejong/SejongAttendance/public/expense_logic.js", "a", encoding="utf-8") as f:
        f.write(missing_js)
    print("Pagination logic appended successfully.")
else:
    print("Pagination logic already present!")
