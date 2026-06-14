import re

def move_pagination(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # We need to extract the pagination-controls block and place it exactly before the closing div of notebook.
    # The structure is:
    # <div class="notebook">
    #   ...
    #   <div class="page page-right">...</div>
    # </div>
    # Currently it's inside page-right.
    
    # Let's just find the block
    block_pattern = r'\s*<!-- Pagination Controls -->\n\s*<div class="pagination-controls">[\s\S]*?</div>\n'
    block = re.search(block_pattern, html)
    if not block:
        print("Block not found in", filepath)
        return
        
    block_text = block.group(0)
    
    # Remove it from wherever it is
    html = html.replace(block_text, '\n')
    
    # Find the closing tag of notebook. In these files, notebook closing tag is usually right before <main> or similar ends.
    # Actually, in expense.html:
    # </div>
    # </main>
    # </div>
    # <script src="expense_logic.js...
    
    # Let's insert it before </main> inside the wrapper
    # Wait, the notebook is: <div class="notebook"> ... </div>
    # So if I replace "</div>\n        </main>" with "block\n</div>\n</main>", it goes after notebook! Wait, that's not inside notebook.
    # To place it inside notebook, we need to find `<div class="binding"></div>\n                    <div class="page page-right">`
    # and the end of page-right.
    # Let's just find `</main>` and put it before `</main>`, and change its CSS to be relative to `main-content` or `notebook-wrapper`.
    # Wait! `.notebook` has `position: relative`!
    # No, `.notebook` doesn't have `position: relative`. `.notebook-wrapper` has `position: relative` maybe?
    # Let's just put it at the end of `.notebook`.
    
    html = html.replace('</main>', block_text + '        </main>')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

move_pagination('Sejong/SejongAttendance/public/expense.html')
move_pagination('Sejong/SejongAttendance/public/phonebook.html')
print("Pagination DOM fixed")
