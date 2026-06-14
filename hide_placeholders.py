def fix_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find the CSS block for placeholder text
    old_css = """        /* 빈 칸일 때 힌트 텍스트 표시 */
        .date-col:empty:not(:focus)::before {
            content: "날짜";
            color: #cbd5e1;
            pointer-events: none;
            font-size: 16px;
        }
        .desc-col:empty:not(:focus)::before {
            content: "이름/내용";
            color: #cbd5e1;
            pointer-events: none;
            font-size: 16px;
        }
        .amount-col:empty:not(:focus)::before {
            content: "수강료";
            color: #cbd5e1;
            pointer-events: none;
            font-size: 16px;
            float: right;
            margin-right: 5px;
        }
        .method-col:empty:not(:focus)::before {
            content: "(카)";
            color: #cbd5e1;
            pointer-events: none;
            font-size: 16px;
        }"""
        
    new_css = """        /* 빈 칸일 때 힌트 텍스트 표시 (사용자 요청으로 숨김) */
        .date-col:empty:not(:focus)::before,
        .desc-col:empty:not(:focus)::before,
        .amount-col:empty:not(:focus)::before,
        .method-col:empty:not(:focus)::before {
            display: none !important;
            content: "";
        }"""

    html = html.replace(old_css, new_css)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

fix_html('Sejong/SejongAttendance/public/expense.html')
print("Hidden placeholders")
