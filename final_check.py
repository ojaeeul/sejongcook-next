import json
import re

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Suspicious endings that suggest truncation
suspicious_endings = ['은', '는', '이', '가', '을', '를', '에', '의', '로', '와', '과', '고', '며', '면', '서', '하', '되', '시키', '만들', '않', '없', '있', '같', '다르', '어렵', '쉽', '언', '낮', '높', '많', '적']

# Whitelist of words that are actually valid nouns but end in suspicious characters
whitelist_words = ['냉장고', '온도계', '오븐에', '도구로', '이하', '이상', '미만', '초과', '저하', '풍미저하', '박하', '다슬기', '가물치', '갈치', '멸치', '꽁치', '참치', '조기', '돼지', '쇠고기', '돼지고기', '닭고기', '물고기', '민물고기', '소고기', '양고기', '살코기', '참게', '멍게', '김치', '누룽지', '백설기', '에너지', '유지', '식용유지', '오렌지', '소시지', '어육소시지', '시금치', '도자기', '파우치', '팡도르', '그랑마르니에', '전자레인지', '전자렌지', '오이지', '양지', '반상치', '가치', '수치', '크기', '무게', '딸기', '모기', '세대기', '잠복기', '이환기', '전염기', '에스테르', '에테르', '수지', '규소수지', '초산비닐수지', '비닐수지', '실리콘수지', '장치', '조치', '설치', '배지', '영지', '잡지', '이바지', '마가린', '쇼트닝', '버터', '밀가루', '설탕', '소금', '물', '우유', '계란', '이스트', '효모', '균', '바이러스', '단백질', '지방', '탄수화물', '당류', '비타민', '무기질', '칼슘', '철분', '나트륨', '온도', '습도', '시간', '방법', '이유', '원인', '결과', '특징', '장점', '단점', '효과', '기능', '역할', '종류', '분류', '과정', '단계', '순서', '조건', '기준', '원칙', '주의사항', '방법', '정도']
# Note: words ending in '기' like 크기, 무게(에), etc.

def check_text(text):
    text = text.strip()
    if not text:
        return False
    # If ends with punctuation or english or number, it's usually fine
    if text[-1] in ['.', '?', '!', ')', ']', '℃', '%', 'g', 'm', 'L', 'l', 'kcal', 'cal', '}', '>', '”', '"', "'", '’']:
        return False
    if re.search(r'[a-zA-Z0-9]$', text):
        return False
        
    last_word = text.split()[-1]
    
    # Check if last word is in whitelist
    if any(last_word.endswith(w) for w in whitelist_words):
        return False
        
    # Check suspicious endings
    for ending in suspicious_endings:
        if text.endswith(ending):
            # Check length to avoid false positive for very short valid words like '오이'
            if len(text) > 3:
                return True
    return False

anomalies = []
for k, qs in data.items():
    for i, q in enumerate(qs):
        if check_text(q.get('q', '')):
            anomalies.append(f"[{k} Q{i+1}] Q: {q.get('q')}")
            
        for j, opt in enumerate(q.get('o', [])):
            if check_text(str(opt)):
                anomalies.append(f"[{k} Q{i+1}] O{j+1}: {opt}")

print(f"Total potential anomalies: {len(anomalies)}")
for a in anomalies[:100]:
    print(a)
