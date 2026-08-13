import json
import re

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for qs in data.values():
    for q in qs:
        q_text = q.get('q', '')
        if "성인여자의 1일 필요열량을 2000kcal" in q_text and ')' not in q.get('o', []):
            print("Found 1:", q_text, q.get('o'))
        if "완제품 중량이 400g인 빵 200개를 만들고자 한다" in q_text and ')' not in q.get('o', []):
            print("Found 2:", q_text, q.get('o'))
        if "식빵 제조시 최고 부피를 얻을 수 있는 유지의 양은?" in q_text and ')' not in q.get('o', []):
            print("Found 3:", q_text, q.get('o'))
        if "버터 톱 식빵 제조 시 분할손실이 3%이고" in q_text and ')' not in q.get('o', []):
            print("Found 4:", q_text, q.get('o'))
        if "가장 적합한 튀김 온도는? (이때 사용되는 튀김유는" in q_text and ')' not in q.get('o', []):
            print("Found 5:", q_text, q.get('o'))
        if "발효시간을 3 시간으로 줄이려 한" in q_text and ')' not in q.get('o', []):
            print("Found 6:", q_text, q.get('o'))
        if "식품의 열량(kcal) 계산공식으로 맞는 것은" in q_text and ')' not in q.get('o', []):
            print("Found 7:", q_text, q.get('o'))
        if "식품위생법규상 영업에 종사하지 못하는 질병" in q_text and ')' not in q.get('o', []):
            print("Found 8:", q_text, q.get('o'))
        if "케이크 반죽의 비중이 정상보다 높을 때" in q_text and ')' not in q.get('o', []):
            print("Found 9:", q_text, q.get('o'))

