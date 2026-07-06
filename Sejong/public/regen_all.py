import json
import os

def get_category(subject):
    if subject in ["한식", "양식", "일식", "중식", "복어"]:
        return "COOKING"
    return "BAKERY"

def generate_html_file(subject, year, questions):
    css_link = "hansik_exam.css"
    category = get_category(subject)
    category_name = "조리기능사" if category == "COOKING" else "제과제빵기능사"
    
    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">    <meta charset="UTF-8">
    <title>{year}년 {subject} {category_name} 기출문제</title>
    <link rel="stylesheet" href="{css_link}">
</head>
<body>
    <div class="print-controls no-print">
        <button class="print-btn" onclick="window.print()">🖨️ 시험지 인쇄</button>
        <button class="back-btn" onclick="history.back()">뒤로가기</button>
    </div>

    <div class="exam-container">
"""

    chunks = [questions[i:i + 15] for i in range(0, len(questions), 15)]
    
    for page_idx, chunk in enumerate(chunks):
        page_num = page_idx + 1
        
        html += f'<div class="page page-{page_num}">'
        html += """<div class="page-container">"""
        
        if page_num == 1:
            html += f"""
            <header class="exam-header">
                <h1>{year}년 {subject} {category_name} 기출문제</h1>
                <div class="exam-info">
                    <span>시험시간: 60분</span>
                    <span>문항수: {len(questions)}문항</span>
                    <span>합격기준: 60점 이상</span>
                </div>
            </header>
            """
        else:
            html += f'<div class="sub-header no-print" style="text-align:right; font-size:10px; color:#aaa; margin-bottom:10px;">{year} {subject} - {page_num}쪽</div>'

        html += """<div class="question-list-container">"""
        
        left_col = chunk[:8]
        right_col = chunk[8:]
        
        for i in range(8):
            html += """<div class="question-row">"""
            
            # --- Left Item ---
            if i < len(left_col):
                q = left_col[i]
                q_num = (page_idx * 15) + i + 1
                
                options_html = ""
                for oid, opt_text in enumerate(q['o']):
                    chars = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"]
                    num_char = chars[oid] if oid < len(chars) else f"({oid+1})"
                    options_html += f'<div class="option">{num_char} {opt_text}</div>'
                
                html += f"""
                    <div class="question-item left-item">
                        <div class="question-text"><span class="question-num">{q_num}.</span> {q['q']}</div>
                        <div class="options">{options_html}</div>
                    </div>"""
            else:
                 html += """<div class="question-item left-item empty"></div>"""
            
            # --- Right Item ---
            if i < len(right_col):
                q = right_col[i]
                q_num = (page_idx * 15) + 8 + i + 1
                
                options_html = ""
                for oid, opt_text in enumerate(q['o']):
                    chars = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"]
                    num_char = chars[oid] if oid < len(chars) else f"({oid+1})"
                    options_html += f'<div class="option">{num_char} {opt_text}</div>'
                
                html += f"""
                    <div class="question-item right-item">
                        <div class="question-text"><span class="question-num">{q_num}.</span> {q['q']}</div>
                        <div class="options">{options_html}</div>
                    </div>"""
            else:
                 html += """<div class="question-item right-item empty"></div>"""
                 
            html += """</div> <!-- End question-row -->"""

        html += """
                </div> <!-- End question-list-container -->
            </div> <!-- End page-container -->
        </div> <!-- End page -->
        """

    # Answer Key Page
    html += """
        <div class="page answer-key-page">
            <section class="answer-key-section">
                <div class="answer-key-header">정 답 표</div>
                <div class="answer-grid">
"""
    for idx, q in enumerate(questions):
        ans_num = q['a']
        ans_char = ["①", "②", "③", "④"][int(ans_num) - 1]
        html += f'<div class="answer-item"><span class="num">{idx+1}</span><span class="ans">{ans_char}</span></div>'
        
    html += """
                </div>
            </section>
        </div>
    </div>
</body>
</html>"""
    
    filename = f"{subject}_{year}.html"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Generated {filename}")

if __name__ == "__main__":
    with open("questions_data.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    # Re-generate questions_data.js
    js_content = """
function getFetchUrl(endpoint, isPost = false) {
    const url = `/api/sejong/${endpoint}`;
    return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
}

window.EXAM_DATA_DB = """
    js_content += json.dumps(data, ensure_ascii=False, indent=2)
    js_content += ";\n"

    with open("questions_data.js", "w", encoding="utf-8") as f:
        f.write(js_content)
    print("Updated questions_data.js")

    # Re-generate static HTML files
    for key, questions in data.items():
        if "_" in key:
            subject, year = key.split("_")
            generate_html_file(subject, year, questions)
