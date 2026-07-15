import json

file_path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Extract the JSON part
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
    for q in questions:
        q_text = q.get("q", "")
        
        # 1. 물 온도 계산 1
        if "다음의 조건에서 물 온도를 계산하면?" in q_text and q.get("a") == 1:
            t = create_table("반죽희망 온도: 23℃<br>밀가루 온도: 25℃<br>실내 온도: 25℃<br>설탕 온도: 25℃<br>쇼트닝 온도: 20℃<br>계란 온도: 20℃<br>수돗물 온도: 23℃<br>마찰계수: 20")
            q["q"] = q_text.replace("<표>", t)
            
        # 2. 공정 목적
        elif "다음은 어떤 공정의 목적인가?" in q_text and q.get("a") == 1:
            t = create_table("자른 면의 점착성을 감소시키고 표피를 형성하여 탄력을 유지시킨다.")
            q["q"] = q_text.replace("<표>", t)

        # 3. 스펀지법 17도
        elif "아래와 같은 조건일 때 스펀지 법에서 사용할 도우의 적당한 물 온도는?" in q_text:
            t = create_table("희망 반죽 온도: 27℃<br>실내 온도: 25℃<br>밀가루 온도: 26℃<br>스펀지 반죽 온도: 24℃<br>마찰계수: 16")
            q["q"] = q_text.replace("<표>", t)

        # 4. 스펀지법 17도 - slightly different wording
        elif "아래와 같은 조건일 때 스펀지 법에서 도우의 물 온도는 몇 도가 적당한가?" in q_text:
            t = create_table("희망 반죽 온도: 27℃<br>실내 온도: 25℃<br>밀가루 온도: 26℃<br>스펀지 반죽 온도: 24℃<br>마찰계수: 16")
            q["q"] = q_text.replace("<표>", t)

        # 5. 스펀지반죽법 9도
        elif "스펀지반죽법(Sponge and dough method)에서 사용할 물의 온도는?" in q_text and q.get("a") == 1:
            t = create_table("희망 반죽 온도: 26℃<br>실내 온도: 26℃<br>밀가루 온도: 21℃<br>스펀지 온도: 28℃<br>마찰계수: 20")
            q["q"] = q_text.replace("<표>", t)

        # 6. 영양관리 절차
        elif "다음은 단체급식의 영양관리에 대한 절차들이다." in q_text:
            t = create_table("㉠ 영양진단(Nutrition Diagnosis)<br>㉡ 영양중재(Nutrition Intervention)<br>㉢ 영양사정(Nutrition Assessment)<br>㉣ 영양모니터링 및 평가(Nutrition Monitoring and Evaluation)")
            q["q"] = q_text.replace("<표>", t)

        # 7. 우유 살균
        elif "우유의 살균처리방법 중 다음과 같은 살균처리는?" in q_text:
            t = create_table("가열온도: 130~150℃<br>가열시간: 0.5~5초")
            q["q"] = q_text.replace("<표>", t)

        # 8. 식단 구성
        elif "다음의 식단 구성 중 편중되어 있는 영양가의 식품군은?" in q_text:
            t = create_table("쌀밥, 라면, 감자조림, 빵, 고구마튀김")
            q["q"] = q_text.replace("<표>", t)

        # 9. 원가요소 610,000원
        elif "다음 원가요소에 따라 산출한 총원가로 옳은 것은?" in q_text:
            t = create_table("직접재료비: 250,000원<br>직접노무비: 140,000원<br>직접경비: 40,000원<br>제조간접비: 120,000원<br>판매관리비: 60,000원")
            q["q"] = q_text.replace("<표>", t)

        # 11. 간장의 재고 (this one is in options array)
        if "o" in q and isinstance(q["o"], list):
            for i, opt in enumerate(q["o"]):
                if "간장의 재고가 10병일 때" in opt and "<표>" in opt:
                    t = create_table("5일 입고: 5병 (단가 3,500원)<br>12일 입고: 10병 (단가 3,500원)<br>20일 입고: 7병 (단가 3,000원)<br>27일 입고: 5병 (단가 3,500원)")
                    q["o"][i] = opt.replace("<표>", t)

        # Replace any remaining <표> with a generic info if we missed any, just to be safe
        if "<표>" in q.get("q", ""):
            t = create_table("[원본 이미지 필요: 식별되지 않은 표 데이터]")
            q["q"] = q["q"].replace("<표>", t)

new_content = "const questionsData = " + json.dumps(data, ensure_ascii=False, indent=2) + ";\n"

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Tables strictly updated with correct exam data!")
