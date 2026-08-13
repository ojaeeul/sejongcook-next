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
        
        found_num = None
        
        match1 = re.search(r'정답[^\d]*(\d)[^\d]{1,10}(아니라|오류|잘못)[^\d]{1,20}(\d)', expl)
        match2 = re.search(r'(\d)[^\d]{1,10}(아니라|오류|잘못)[^\d]{1,20}(정답|답)[^\d]*(\d)', expl)
        match3 = re.search(r'(실제|올바른)\s*(정답|답)[^\d]*(\d)', expl)
        match4 = re.search(r'(정답|답)이\s*\'?(\d)\'?번인\s*이유', expl)
        
        if match1:
            found_num = int(match1.group(3))
        elif match2:
            found_num = int(match2.group(4))
        elif match3:
            found_num = int(match3.group(3))
        elif match4:
            found_num = int(match4.group(2))
        else:
            match5 = re.search(r'(정답은|정답:|답은|정답이)\s*\'?(\d)', expl)
            if match5:
                num = int(match5.group(2))
                idx = match5.end()
                context = expl[idx:idx+15]
                if "아니라" in context or "오류" in context or "잘못" in context:
                    match_later = re.search(r'(\d)번', expl[idx:])
                    if match_later:
                        found_num = int(match_later.group(1))
                else:
                    found_num = num
            else:
                match6 = re.search(r'(\d)번이\s*정답', expl)
                if match6:
                    found_num = int(match6.group(1))
                else:
                    match7 = re.search(r'(\d)번이.*가장 명확', expl)
                    if match7:
                        found_num = int(match7.group(1))

        if found_num and 1 <= found_num <= len(options):
            if current_a != found_num:
                fixes.append(f"[{exam_key} Q{i+1}] Pattern: a={current_a} -> {found_num} | e={expl[:80]}...")
                q['a'] = found_num
                fixed_count += 1
            continue
            
        best_match_idx = -1
        expl_prefix = expl[:30] 
        
        for idx, opt in enumerate(options):
            if not opt: continue
            opt_str = str(opt).strip()
            if opt_str in expl_prefix and len(opt_str) > 2:
                best_match_idx = idx + 1
                break
                
        if best_match_idx != -1 and current_a != best_match_idx:
            fixes.append(f"[{exam_key} Q{i+1}] Prefix: a={current_a} -> {best_match_idx} | e={expl[:80]}...")
            q['a'] = best_match_idx
            fixed_count += 1

print(f"Total fixes applied: {fixed_count}")
for f in fixes[:50]:
    print(f)

with open('Sejong/SejongAttendance/public/questions_data_fixed_temp.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
