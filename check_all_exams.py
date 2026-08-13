import json

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

keywords = {
    '한식': ['구절판', '신선로', '비빔밥', '잣가루', '북어', '무생채', '탕평채', '육회', '불고기', '더덕', '미나리강회', '콩나물밥', '칠절판'],
    '양식': ['마요네즈', '오믈렛', '브라운 스톡', '루(roux)', '콩소메', '베샤멜', '미르포아', '타르타르', '브라운소스', '홀란다이즈', '알라킹', '바베큐'],
    '일식': ['사시미', '가쓰오부시', '초밥', '스시', '덴푸라', '데리야끼', '우동', '소바', '폰즈', '차완무시'],
    '중식': ['탕수육', '마파두부', '팔보채', '라조기', '깐풍기', '웍', '녹말물', '짜장', '짬뽕', '춘장', '고추기름', '피단'],
    '제빵': ['식빵', '이스트', '발효', '스트레이트법', '스펀지도법', '글루텐', '둥글리기', '중간발효'],
    '제과': ['파운드', '스펀지케이크', '크림법', '비중', '머랭', '마카롱', '아이싱', '베이킹파우더', '슈 반죽']
}

suspicious_exams = []

for k, qs in data.items():
    expected_cat = None
    if '한식' in k: expected_cat = '한식'
    elif '양식' in k: expected_cat = '양식'
    elif '일식' in k: expected_cat = '일식'
    elif '중식' in k: expected_cat = '중식'
    elif '제과제빵' in k: continue
    elif '제빵' in k: expected_cat = '제빵'
    elif '제과' in k: expected_cat = '제과'
    else: continue
        
    counts = {cat: 0 for cat in keywords}
    
    # Only check the last 15 questions (where practical specific questions lie)
    practical_qs = qs[-15:] if len(qs) >= 15 else qs
    
    for q in practical_qs:
        text = q.get('q', '') + " " + " ".join(str(o) for o in q.get('o', [])) + " " + q.get('e', '')
        for cat, kws in keywords.items():
            for kw in kws:
                if kw in text:
                    counts[cat] += 1
                    
    # Analyze if it strongly mismatched
    # If the expected category has 0 keywords in the last 15 questions, but another category has >= 2 keywords, it's highly suspicious!
    max_cat = max(counts, key=counts.get)
    max_val = counts[max_cat]
    
    if expected_cat in ['제과', '제빵']:
        # Baking and Pastry overlap heavily, so don't be too strict between them
        if counts[expected_cat] == 0 and counts[max_cat] >= 2 and max_cat not in ['제과', '제빵']:
            suspicious_exams.append((k, expected_cat, counts))
    else:
        # Culinary overlap is minimal in practical part
        if counts[expected_cat] == 0 and max_val >= 2:
            suspicious_exams.append((k, expected_cat, counts))
            
print(f"Total exams checked: {len(data)}")
print(f"Suspicious exams found: {len(suspicious_exams)}")
for k, exp, cnt in suspicious_exams:
    print(f"[{k}] Expected: {exp}, Got: {cnt}")

