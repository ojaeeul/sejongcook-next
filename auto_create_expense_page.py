import re

with open("Sejong/SejongAttendance/public/expense_logic.js", "r", encoding="utf-8") as f:
    js = f.read()

# 1. Always enable the Next button
js = js.replace("if (nextBtn) nextBtn.disabled = currentExpensePage >= totalPages - 1;", "if (nextBtn) nextBtn.disabled = false; // 항상 다음 페이지 추가 가능")

# 2. Automatically create pages in changeExpensePage
create_page_logic = """
    if (dir > 0 && currentExpensePage + dir >= totalPages) {
        // Automatically create a new page
        for (let i = 0; i < LINES_PER_PAGE; i++) {
            expenseContainer.insertAdjacentHTML('beforeend', `
                <div class="entry-line">
                    <div class="date-col" contenteditable="true"></div>
                    <div class="desc-col" contenteditable="true"></div>
                    <div class="amount-col" contenteditable="true"></div>
                    <div class="method-col" contenteditable="true"></div>
                </div>
            `);
        }
        
        const cookingContainer = document.getElementById('sales-cooking-container');
        if (cookingContainer) {
            for (let i = 0; i < LINES_PER_PAGE; i++) {
                cookingContainer.insertAdjacentHTML('beforeend', `
                    <div class="entry-line">
                        <div class="date-col" contenteditable="true"></div>
                        <div class="desc-col" contenteditable="true"></div>
                        <div class="amount-col" contenteditable="true"></div>
                        <div class="method-col" contenteditable="true"></div>
                    </div>
                `);
            }
        }
        
        const bakingContainer = document.getElementById('sales-baking-container');
        if (bakingContainer) {
            for (let i = 0; i < LINES_PER_PAGE; i++) {
                bakingContainer.insertAdjacentHTML('beforeend', `
                    <div class="entry-line">
                        <div class="desc-col" contenteditable="true"></div>
                        <div class="amount-col" contenteditable="true"></div>
                        <div class="method-col" contenteditable="true"></div>
                    </div>
                `);
            }
        }
    } else if (currentExpensePage + dir < 0) {
        return;
    }
"""

js = re.sub(r'    if \(currentExpensePage \+ dir < 0 \|\| currentExpensePage \+ dir >= totalPages\) return;\n', create_page_logic, js)

with open("Sejong/SejongAttendance/public/expense_logic.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Auto page creation added.")
