import json

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

keywords = {
    '한식': ['구절판', '신선로', '고추장', '된장', '불고기', '육회', '잡채', '김치', '전골'],
    '양식': ['마요네즈', '오믈렛', '브라운 스톡', '루(roux)', '콩소메', '베샤멜', '미르포아', '퐁(fond)', '브라운소스', '타르타르소스', '샐러드'],
    '일식': ['사시미', '가쓰오부시', '가이세키', '스시', '초밥', '덴푸라', '데리야끼'],
    '중식': ['탕수육', '마파두부', '팔보채', '라조기', '깐풍기', '중화냄비', '웍'],
    '제과': ['스펀지 케이크', '파운드 케이크', '쿠키', '머랭', '크림법', '슈 반죽', '마카롱'],
    '제빵': ['식빵', '스펀지도법', '이스트', '스트레이트법', '글루텐', '발효실']
}

# Ignore common words that might legitimately overlap
# Actually, let's just count occurrences of the keywords in each category
results = {
    '한식': {k: 0 for k in keywords},
    '양식': {k: 0 for k in keywords},
    '일식': {k: 0 for k in keywords},
    '중식': {k: 0 for k in keywords},
    '제과': {k: 0 for k in keywords},
    '제빵': {k: 0 for k in keywords},
}

for k, qs in data.items():
    # Determine the category of the exam
    category = None
    if '한식' in k: category = '한식'
    elif '양식' in k: category = '양식'
    elif '일식' in k: category = '일식'
    elif '중식' in k: category = '중식'
    elif '제과제빵' in k: 
        # Skip mixed exams for this strict check, or check both
        continue
    elif '제과' in k: category = '제과'
    elif '제빵' in k: category = '제빵'
    
    if not category:
        continue
        
    for q in qs:
        text = q.get('q', '') + " " + " ".join(str(o) for o in q.get('o', [])) + " " + q.get('e', '')
        
        # Check against all keyword lists
        for kw_category, kw_list in keywords.items():
            for kw in kw_list:
                if kw in text:
                    results[category][kw_category] += 1
                    break # count at most once per question per kw_category

print(f"{'Exam Type':<10} | {'한식 KWs':<10} | {'양식 KWs':<10} | {'일식 KWs':<10} | {'중식 KWs':<10} | {'제과 KWs':<10} | {'제빵 KWs':<10}")
print("-" * 80)
for cat, counts in results.items():
    print(f"{cat:<10} | {counts['한식']:<10} | {counts['양식']:<10} | {counts['일식']:<10} | {counts['중식']:<10} | {counts['제과']:<10} | {counts['제빵']:<10}")

