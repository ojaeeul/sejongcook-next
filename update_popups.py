import json

filepath = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/public/data/popups.json"

with open(filepath, 'r') as f:
    popups = json.load(f)

new_id = max(p.get('id', 0) for p in popups) + 1 if popups else 1

new_popup = {
    "id": new_id,
    "type": "template",
    "templateId": "course_recruit_v2",
    "title": "주말(토요일) 제과제빵 정규반",
    "isActive": True,
    "position": { "top": 150, "left": 150 },
    "size": { "width": 450, "height": 650 },
    "content": {
        "textVisible": True,
        "badgeText": "기초부터 확실하게!",
        "title": "주말(토요일)\n제과·제빵 정규반",
        "subText": "세종요리제과기술학원만의 특별한 노하우 전수",
        "scheduleA": {
            "label": "모집기간",
            "period": "상시모집! 언제든 신청 가능",
            "time": ""
        },
        "scheduleB": {
            "label": "수업시간",
            "period": "매주 토요일 진행",
            "time": "제과(오전 10:00) / 제빵(오후 진행)"
        },
        "scheduleC": {
            "label": "수업내용",
            "period": "제과기능사 / 제빵기능사 실기 품목",
            "time": "매주 2가지씩 집중 실습"
        },
        "mainImage": "/img_up/tmp/baking_poster_bg_v2.png"
    },
    "link": "/course/baking"
}

popups.append(new_popup)

with open(filepath, 'w', encoding='utf-8') as f:
    json.dump(popups, f, ensure_ascii=False, indent=4)

print("Added new popup with ID:", new_id)
