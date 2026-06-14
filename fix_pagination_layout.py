import re

def fix_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Move pagination-controls inside notebook
    # Find the end of notebook </div> and pagination-controls block
    # Actually, it's easier to just use regex
    pattern = r'(                </div>\n)\s*(<!-- Pagination Controls -->\n\s*<div class="pagination-controls">[\s\S]*?</div>)'
    replacement = r'                \2\n\1'
    
    html = re.sub(pattern, replacement, html)
    
    # Also another occurrence at line 600+
    pattern2 = r'(            </div>\n)\s*(<!-- Pagination Controls -->\n\s*<div class="pagination-controls">[\s\S]*?</div>)'
    html = re.sub(pattern2, r'                \2\n\1', html)

    # Change CSS
    old_css = """        .pagination-controls {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            padding-bottom: 200px;
        }"""
    
    new_css = """        .pagination-controls {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            z-index: 50;
        }
        .page-indicator {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: 16px;
            font-weight: 800;
            color: #1e293b;
            line-height: 1.1;
        }"""
        
    html = html.replace(old_css, new_css)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

fix_html('Sejong/SejongAttendance/public/expense.html')
fix_html('Sejong/SejongAttendance/public/phonebook.html')
print("HTML and CSS fixed")

def fix_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    # Change textContent to innerHTML with spans
    js = js.replace("indicator.textContent = `${currentExpensePage + 1} / ${totalPages}`;", 
                    "indicator.innerHTML = `<span>${currentExpensePage + 1}</span><span>/</span><span>${totalPages}</span>`;")
    js = js.replace("indicator.textContent = `${currentPage + 1} / ${totalPages}`;", 
                    "indicator.innerHTML = `<span>${currentPage + 1}</span><span>/</span><span>${totalPages}</span>`;")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

fix_js('Sejong/SejongAttendance/public/expense_logic.js')
fix_js('Sejong/SejongAttendance/public/phonebook.js')
print("JS fixed")
