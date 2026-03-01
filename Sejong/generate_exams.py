import random
import os
import json
import exam_data_pools as dp

# Configuration
# Configuration
subjects = ["한식", "양식", "일식", "중식", "제과", "제빵", "제과제빵", "복어"]
years = [2021, 2022, 2023, 2024, 2025, 2026]

all_exams_data = {}

def get_category(subject):
    if subject in ["한식", "양식", "일식", "중식", "복어"]:
        return "COOKING"
    return "BAKERY"

def get_subject_pool(subject):
    if subject == "한식": return dp.COOK_HANSIK_H
    if subject == "양식": return dp.COOK_YANGSIK_H
    if subject == "일식": return dp.COOK_ILSIK_H
    if subject == "중식": return dp.COOK_JUNGSIK_H
    if subject == "제과": return dp.BAKE_JEGWA_H
    if subject == "제빵": return dp.BAKE_JEBBANG_H
    if subject == "제과제빵": return dp.BAKE_JEGWA_H + dp.BAKE_JEBBANG_H
    if subject == "복어": return dp.COOK_COMMON_H # Fallback to common for now
    return []

def generate_exam_set(subject, year):
    # Seed for reproducibility (per year/subject)
    random.seed(f"{subject}_{year}_v4_separated") 
    
    category = get_category(subject)
    
    # 1. Mandatory Killer Questions (Fixed 4)
    if category == "COOKING":
        killer_pool = dp.COOK_KILLER
    else:
        killer_pool = dp.BAKE_KILLER
        
    if len(killer_pool) < 4:
         selected_k = random.choices(killer_pool, k=4)
    else:
         selected_k = random.sample(killer_pool, 4)
         
    # 1.5 Discriminator Questions (Fixed 2)
    if category == "COOKING":
        discrim_pool = dp.COOK_DISCRIM
    else:
        discrim_pool = dp.BAKE_DISCRIM
        
    if len(discrim_pool) < 2:
        selected_d = random.choices(discrim_pool, k=2)
    else:
        selected_d = random.sample(discrim_pool, 2)
         
    # 2. Calculation Questions (Fixed 7)
    if category == "COOKING":
        calc_pool = dp.COOK_CALC_POOL
    else:
        calc_pool = dp.BAKE_CALC_POOL
        
    if len(calc_pool) < 7:
        selected_c = random.choices(calc_pool, k=7) 
    else:
        selected_c = random.sample(calc_pool, 7)

    # 3. Easy Questions (Fixed 7)
    if category == "COOKING":
        easy_pool = dp.COOK_COMMON_E
    else:
        easy_pool = dp.BAKE_COMMON_E
        
    if len(easy_pool) < 7:
        selected_e = random.choices(easy_pool, k=7)
    else:
        selected_e = random.sample(easy_pool, 7)

    # 4. Hard Questions (Remaining 40 to reach 60 Total)
    target_main_hard = 40
    
    sub_hard_pool = get_subject_pool(subject)
    if category == "COOKING":
        common_hard_pool = dp.COOK_COMMON_H
    else:
        common_hard_pool = dp.BAKE_COMMON_H
    
    selected_h = []
    
    # Priority: Subject Hard -> Common Hard
    if len(sub_hard_pool) >= target_main_hard:
        selected_h = random.sample(sub_hard_pool, target_main_hard)
    else:
        selected_h.extend(sub_hard_pool)
        needed = target_main_hard - len(selected_h)
        # Fill remainder with Common Hard
        if len(common_hard_pool) < needed:
             selected_h.extend(random.choices(common_hard_pool, k=needed))
        else:
            selected_h.extend(random.sample(common_hard_pool, needed))
            
    # Combine all parts
    final_exam = selected_k + selected_d + selected_h + selected_c + selected_e
    
    # Shuffle
    random.shuffle(final_exam)
    
    return final_exam

def generate_html_file(subject, year, questions):
    css_link = "hansik_exam.css"
    category = get_category(subject)
    category_name = "조리기능사" if category == "COOKING" else "제과제빵기능사"
    
    html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
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

    # PAGINATION LOGIC: 15 Questions per Page (Left 8, Right 7)
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
        ans_char = ["①", "②", "③", "④"][ans_num - 1]
        html += f'<div class="answer-item"><span class="num">{idx+1}</span><span class="ans">{ans_char}</span></div>'
        
    html += """
                </div>
            </section>
        </div>
    </div>
</body>
</html>"""
    
    filename = f"public/{subject}_{year}.html"
    with open(filename, "w", encoding="utf-8") as f:
        f.write(html)
    return filename

if __name__ == "__main__":
    if not os.path.exists("public"):
        os.makedirs("public")
        
    for sub in subjects:
        for yr in years:
            exam_questions = generate_exam_set(sub, yr)
            key = f"{sub}_{yr}"
            all_exams_data[key] = exam_questions
            generate_html_file(sub, yr, exam_questions)
            
    with open("public/questions_data.json", "w", encoding="utf-8") as f:
        json.dump(all_exams_data, f, ensure_ascii=False, indent=2)
        
    with open("public/questions_data.js", "w", encoding="utf-8") as f:
        f.write(f"window.EXAM_DATA_DB = {json.dumps(all_exams_data, ensure_ascii=False, indent=2)};")
        
    print(f"Generated {len(all_exams_data)} exams with Strict SEPARATION & High Difficulty.")
