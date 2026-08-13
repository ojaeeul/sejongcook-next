import json
import re

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

suspects = []

for exam_key, questions in data.items():
    for i, q in enumerate(questions):
        if 'e' not in q or not q['e'] or 'a' not in q or not q['o']:
            continue
            
        current_a = q['a']
        expl = q['e']
        options = q['o']
        
        # 찾을 패턴들: 
        # "정답: 2", "정답은 2", "답은 2", "정답이 2", "정답 2", "2번이 정답"
        # "정답은 X가 아니라 Y"와 같은 특수 패턴은 이미 앞서 처리되었지만, 
        # 남아있는 단순 명시 패턴 중에서 a와 다른 것이 있는지 찾는다.
        
        found_nums = set()
        
        # 1. 명확히 '정답'이라는 단어 주변의 숫자
        matches = re.finditer(r'(정답|답)[^\d]{0,10}(\d)', expl)
        for m in matches:
            found_nums.add(int(m.group(2)))
            
        matches2 = re.finditer(r'(\d)번이\s*(정답|답)', expl)
        for m in matches2:
            found_nums.add(int(m.group(1)))
            
        matches3 = re.finditer(r'(정답|답)이\s*\'?(\d)\'?번', expl)
        for m in matches3:
            found_nums.add(int(m.group(2)))
            
        # 2. 설명 첫 부분에 옵션 텍스트가 그대로 나오는데 정답과 다를 때
        best_match_idx = -1
        expl_prefix = expl[:30] 
        for idx, opt in enumerate(options):
            if not opt: continue
            opt_str = str(opt).strip()
            # 길이가 3 이상인 보기 텍스트가 설명의 가장 처음에 등장하는 경우
            if len(opt_str) > 2 and opt_str in expl_prefix:
                best_match_idx = idx + 1
                break
                
        if best_match_idx != -1 and current_a != best_match_idx:
             # Prefix 의심
             # 단, 설명 안에서 "X번 오답은" 처럼 오답을 설명하는 것일 수도 있으므로 보수적으로 추가
             if "오답" not in expl_prefix and "아닙" not in expl_prefix and "틀린" not in expl_prefix:
                 suspects.append(f"[{exam_key} Q{i+1}] Prefix 의심: 현재답={current_a} vs 해설지목={best_match_idx} | 해설: {expl[:80]}...")
                 continue
                 
        # 명시적 번호 매칭 검사
        valid_found_nums = [n for n in found_nums if 1 <= n <= len(options)]
        if valid_found_nums:
            # 해설에서 언급된 '정답' 번호가 현재 답과 일치하지 않는 것이 있다면 의심
            if current_a not in valid_found_nums:
                # 단, 여러 번호가 언급된 경우 오답 설명일 수 있음 (예: "정답은 1번, 2번은~") 
                # 그래서 현재 답이 언급되지 않은 경우만 리포트
                suspects.append(f"[{exam_key} Q{i+1}] 숫자 불일치 의심: 현재답={current_a} vs 언급된번호={valid_found_nums} | 해설: {expl[:80]}...")

print(f"Total suspects found: {len(suspects)}")
for s in suspects[:100]:
    print(s)
