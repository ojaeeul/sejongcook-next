import json
import re

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

fixes = []
fixed_count = 0

for exam_key, questions in data.items():
    for i, q in enumerate(questions):
        if 'e' not in q or not q['e'] or 'a' not in q or not q['o']:
            continue
            
        current_a = q['a']
        expl = q['e']
        options = q['o']
        
        # 1. "정답 X번", "답 X번", "정답은 X번", "정답: X번", "정답(X번)"
        # 2. "X번이 정답", "X번은 정답"
        found_nums = set()
        
        # 확실한 정답 지목 패턴
        strong_matches = re.findall(r'(?:정답|답)\s*(?:은|이|:)?\s*\(?\'?(\d)\'?\)?(?:번)?\s*(?:은|이|입|입니다|이므로|이기)', expl)
        for m in strong_matches: found_nums.add(int(m))
        
        strong_matches2 = re.findall(r'\(?\'?(\d)\'?\)?번(?:이|은)\s*(?:정답|답)', expl)
        for m in strong_matches2: found_nums.add(int(m))

        strong_matches3 = re.findall(r'(?:정답|답)\s*\(?\'?(\d)\'?\)?번', expl)
        for m in strong_matches3: found_nums.add(int(m))
        
        valid_found = [n for n in found_nums if 1 <= n <= len(options)]
        
        # 만약 해설에서 확실하게 단 하나의 번호만 정답으로 지목하고 있다면
        if len(valid_found) == 1:
            ans = valid_found[0]
            if current_a != ans:
                # 단, "오류" 나 "아니라" 패턴이 있어서 앞선 스크립트가 맞게 고친 것을 되돌리면 안됨.
                if "오류" in expl and str(current_a) in expl:
                    pass
                elif "아니" in expl and str(current_a) in expl:
                    pass
                elif "잘못" in expl and str(current_a) in expl:
                    pass
                else:
                    fixes.append(f"[{exam_key} Q{i+1}] Obvious mismatch: a={current_a} -> {ans} | e={expl[:60]}...")
                    q['a'] = ans
                    fixed_count += 1
            
print(f"Total fixes applied: {fixed_count}")
for f in fixes[:50]:
    print(f)

with open('Sejong/SejongAttendance/public/questions_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
