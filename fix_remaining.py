import json

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Explicitly append '다' to these exact strings
needs_da = [
    '미끄러운 신발을 갈아 신는',
    '설치하지 않는 것이 위생적이',
    '물을 전혀 쓰지 않고 휴지로 닦는',
    '냉동하면 단백질은 절대 응고되지 않는',
    '식재료를 공기와 접촉하지 않게 밀봉하여 수분 증발을 막는',
    '비타민 C의 산화를 억제하여 변색을 막는',
    '수분은 글루텐 형성과는 전혀 무관하',
    '산 성분이 강한 토마토나 식초 음식을 장시간 조리하지 않는',
    '강철 수세미로 매일 윤이 나게 닦는',
    '양갱을 만드는 주요 원료이',
    '펙틴의 구조는 폴리갈락투론산의 메틸 화합물이',
    '펙틴은 과실이나 채소류 등의 세포막이나 세포막 사이의 엷은 층에 존재하는 물질이',
    '김치류 중 배추김치는 식품안전관리인증기준 대상식품이'
]

fixed_count = 0

for k, qs in data.items():
    for q in qs:
        # Check q
        q_text = q.get('q', '')
        if q_text in needs_da:
            q['q'] = q_text + '다'
            fixed_count += 1
            
        # Check options
        opts = q.get('o', [])
        for j, opt in enumerate(opts):
            opt_str = str(opt).strip()
            if opt_str in needs_da:
                q['o'][j] = opt_str + '다'
                fixed_count += 1

print(f"Fixed {fixed_count} additional specific truncations.")

with open('Sejong/SejongAttendance/public/questions_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
