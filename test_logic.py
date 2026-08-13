import re

expl = "정답이 1번인 이유는 '브레이징(braising)'이 덩어리 고기를 먼저 구워 육즙을 가둔 뒤, 소량의 수분(물, 우유 등)을 넣고 밀폐하여 부드럽게 익히는 습열·건열 복합 조리법이기 때문입니다. 2번의 스튜잉은 주로 한 입 크기의 작은 고기를 잠길 정도로 물을 부어 끓이는 방식이며, 3번 브로일링과 4번 로스팅은 물을 사용하지 않고 열로만 익히는 건열 조리법이므로 오답입니다."
options = [
    "브레이징(braising)",
    "스튜잉(stewing)",
    "브로일링(broiling)",
    "로스팅(roasting)"
]

current_a = 1

found_num = None
match = re.search(r'(정답은|정답:|답은|정답이)\s*(\d)', expl)
if match:
    found_num = int(match.group(2))
else:
    match = re.search(r'(\d)번이 정답', expl)
    if match:
        found_num = int(match.group(1))
    else:
        match = re.search(r'(\d)번이.*가장 명확', expl)
        if match:
            found_num = int(match.group(1))

print("Pattern Match:", found_num)

best_match_idx = -1
expl_prefix = expl[:30] 
print("Prefix:", expl_prefix)

for idx, opt in enumerate(options):
    if not opt: continue
    opt_str = str(opt).strip()
    if opt_str in expl_prefix and len(opt_str) > 2:
        best_match_idx = idx + 1
        break

print("Prefix Match:", best_match_idx)

