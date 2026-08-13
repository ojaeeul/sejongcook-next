import json
import re

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

fixed_count = 0

for exam_key, questions in data.items():
    for i, q in enumerate(questions):
        if 'e' not in q or not q['e'] or 'a' not in q or not q['o']:
            continue
            
        current_a = q['a']
        expl = q['e']
        options = q['o']
        
        found_num = None
        # 1. Matches like "정답은 1번", "정답: 1", "정답이 1번인", "답은 1", "1번이 정답"
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

        if found_num and 1 <= found_num <= len(options):
            if current_a != found_num:
                q['a'] = found_num
                fixed_count += 1
            continue
            
        # 2. Check if an exact option text is the very first thing in the explanation
        best_match_idx = -1
        expl_prefix = expl[:30] 
        
        for idx, opt in enumerate(options):
            if not opt: continue
            opt_str = str(opt).strip()
            # If the option string contains a number, be careful
            if opt_str in expl_prefix and len(opt_str) > 2:
                best_match_idx = idx + 1
                break
                
        if best_match_idx != -1 and current_a != best_match_idx:
            q['a'] = best_match_idx
            fixed_count += 1

print(f"Total additional fixes applied: {fixed_count}")

with open('Sejong/SejongAttendance/public/questions_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
