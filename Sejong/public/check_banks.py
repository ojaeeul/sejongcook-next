import json
import unicodedata

def run():
    with open('questions_data.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
        
    hansik = []
    yangsik = []
    ilsik = []
    jungsik = []
    bogeo = []
    jegwa = []
    jebbang = []
    
    for key, v in d.items():
        k = unicodedata.normalize('NFC', key)
        if '오재을' not in k:
            continue
        if '주관식' in k:
            continue
            
        questions = [q for q in v if not q.get('is_subjective', False)]
        
        if '제과' in k:
            jegwa.extend(questions)
        elif '제빵' in k:
            jebbang.extend(questions)
        elif '양식' in k:
            yangsik.extend(questions)
        elif '일식' in k:
            ilsik.extend(questions)
        elif '중식' in k:
            jungsik.extend(questions)
        elif '복어' in k:
            bogeo.extend(questions)
        elif '한식' in k or ('조리기능사' in k and '떡' not in k and '복어' not in k):
            hansik.extend(questions)
            
    print(f"한식: {len(hansik)}")
    print(f"양식: {len(yangsik)}")
    print(f"일식: {len(ilsik)}")
    print(f"중식: {len(jungsik)}")
    print(f"복어: {len(bogeo)}")
    print(f"제과: {len(jegwa)}")
    print(f"제빵: {len(jebbang)}")

run()
