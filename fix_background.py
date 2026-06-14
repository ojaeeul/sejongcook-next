import re

def fix_css(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # The current string:
    # background-image: repeating-linear-gradient(transparent, transparent 23px, #cbd5e1 23px, #cbd5e1 24px);
    # background-position: 0 40px;
    # background-size: 100% 768px; /* 24px * 32칸 = 768px */
    # background-repeat: no-repeat;
    
    old_css = """background-image: repeating-linear-gradient(transparent, transparent 23px, #cbd5e1 23px, #cbd5e1 24px);
            background-position: 0 40px;
            background-size: 100% 768px; /* 24px * 32칸 = 768px */
            background-repeat: no-repeat;"""
            
    new_css = """/* Use linear-gradient and background-size to prevent zoom subpixel shifting bugs */
            background-image: linear-gradient(to bottom, transparent 23px, #cbd5e1 23px, #cbd5e1 24px);
            background-position: 0 40px;
            background-size: 100% 24px;
            background-repeat: repeat-y;"""
            
    html = html.replace(old_css, new_css)
    
    # Wait, if we use repeat-y, it will draw lines on the bottom padding as well.
    # To fix this, we can wrap the content in a div or just let it draw on the bottom padding.
    # It's better to draw on the bottom padding than to have misaligned lines.
    
    # Also ensure .entry-line doesn't grow
    old_entry = """        .entry-line {
            font-weight: bold;
            line-height: 24px;
            height: 24px;"""
            
    new_entry = """        .entry-line {
            font-weight: bold;
            line-height: 24px;
            height: 24px;
            min-height: 24px;
            max-height: 24px;
            box-sizing: border-box;"""
            
    html = html.replace(old_entry, new_entry)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

fix_css('Sejong/SejongAttendance/public/expense.html')
print("Fixed background and entry-line height")
