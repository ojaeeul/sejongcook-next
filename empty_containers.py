import re

def clear_container(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Clear expense-container
    pattern = r'(<div id="expense-container"[^>]*>)(.*?)(</div>\s*</div>\s*<!-- 중앙 스프링 -->)'
    html = re.sub(pattern, r'\1\n                        \3', html, flags=re.DOTALL)

    # Clear sales-cooking-container
    pattern = r'(<div class="right-col-half" id="sales-cooking-container">)(.*?)(</div>\s*<!-- 매출 두 번째 단 -->)'
    html = re.sub(pattern, r'\1\n                            \3', html, flags=re.DOTALL)

    # Clear sales-baking-container
    pattern = r'(<div class="right-col-half" id="sales-baking-container">)(.*?)(</div>\s*</div>\s*</div>)'
    html = re.sub(pattern, r'\1\n                            \3', html, flags=re.DOTALL)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

clear_container('Sejong/SejongAttendance/public/expense.html')
print("Expense containers cleared")
