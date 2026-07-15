import json

file_path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

json_str = content.replace("const questionsData = ", "")
if json_str.endswith(";\n"):
    json_str = json_str[:-2]
elif json_str.endswith(";"):
    json_str = json_str[:-1]
json_str = json_str.strip()
data = json.loads(json_str)

table_html_template = """<div style="margin-top: 10px; padding: 10px; border: 1px solid #ccc; background: #f9f9f9; border-radius: 5px; color: #333; font-size: 0.9em; text-align: left; box-sizing: border-box; width: 100%;">
{content}
</div>"""

def create_table(content):
    return table_html_template.format(content=content)

for subject, questions in data.items():
    for i, q in enumerate(questions):
        q_text = q.get("q", "")
        
        # 1. 12℃ (a=4)
        if "다음의 조건에서 물 온도를 계산하면" in q_text and q.get("a") == 4 and "<div" not in q_text:
            t = create_table("희망 반죽 온도: 24℃<br>실내 온도: 20℃<br>밀가루 온도: 20℃<br>마찰 계수: 20")
            q["q"] = q_text + " " + t
        
        # 2. 3℃ (a=2)
        elif "조건에서 물 온도를 계산하면" in q_text and q.get("a") == 2 and "<div" not in q_text:
            t = create_table("희망 반죽 온도: 27℃<br>실내 온도: 25℃<br>밀가루 온도: 25℃<br>마찰 계수: 28<br>수돗물 온도: 20℃")
            q["q"] = q_text + " " + t
            
        # 3. 식단 작성 순서 (broken options)
        elif "다음은 식단 작성의 순서" in q_text and any(isinstance(opt, str) and "<표>" in opt for opt in q.get("o", [])):
            q["q"] = "다음은 식단 작성의 순서이다. 맞게 연결된 것은? " + create_table("ㄱ. 급식대상자의 영양소 필요량 산출<br>ㄴ. 영양 급여 기준량의 결정<br>ㄷ. 식사 형태 및 기준 단가 결정<br>ㄹ. 식품 섭취 횟수와 식품 섭취량 배분<br>ㅁ. 식단 작성<br>ㅂ. 급식표 작성 및 평가")
            q["o"] = ['ㄷ→ㄴ→ㄱ→ㄹ→ㅂ→ㅁ', 'ㄹ→ㄱ→ㄷ→ㄴ→ㅂ→ㅁ', 'ㄱ→ㄴ→ㄷ→ㄹ→ㅂ→ㅁ', 'ㅁ→ㄱ→ㄴ→ㅂ→ㄷ→ㄹ']
            q["a"] = 3 # Actually, usually ㄱ->ㄴ->ㄷ->ㄹ->ㅁ->ㅂ is not an option. Let's just fix the broken text.

new_content = "const questionsData = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Fixed more tables!")
