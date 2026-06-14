import re

def add_loading(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Add loading message to expense-container
    html = html.replace('<div id="expense-container" style="margin-top: 48px;">\n                        </div>', '<div id="expense-container" style="margin-top: 48px;">\n                            <div class="loading" style="text-align:center; padding:50px; color:#64748b; width: 100%;">데이터를 불러오는 중입니다...</div>\n                        </div>')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

add_loading('Sejong/SejongAttendance/public/expense.html')
print("Added loading state")
