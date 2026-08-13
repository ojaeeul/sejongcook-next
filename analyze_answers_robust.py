import json
import re

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

fixed_count = 0
fixes = []

for exam_key, questions in data.items():
    for i, q in enumerate(questions):
        if 'e' not in q or not q['e'] or 'a' not in q or not q['o']:
            continue
            
        current_a = q['a']
        expl = q['e']
        options = q['o']
        
        # Look for error correction phrases first! (Highest priority)
        # e.g., "실제 올바른 정답은 1번", "올바른 정답은 1번", "실제 정답은 1", "정답은 1번이 맞"
        correction_match = re.search(r'(실제\s*올바른\s*정답은|올바른\s*정답은|실제\s*정답은)\s*\'?(\d)', expl)
        if correction_match:
            found_num = int(correction_match.group(2))
            if current_a != found_num and 1 <= found_num <= len(options):
                q['a'] = found_num
                fixed_count += 1
                fixes.append(f"[{exam_key} Q{i+1}] Correction Match: {current_a} -> {found_num} | {expl[:100]}")
            continue

        # Look for negative phrase ignoring (e.g. "정답: 2번 은 오류")
        # To avoid matching the wrong answer, we can find ALL matches and see if any is marked as correct.
        
        # A more robust regex: find all mentions of answers
        # If there's only one mention, use it.
        # If there's multiple, and one is preceded by "오류", ignore it.
        
        # For simplicity, if we see "오류", let's be very careful.
        is_error_mentioned = "오류" in expl or "잘못" in expl
        
        if is_error_mentioned:
            # Try to find the correct one specifically
            match = re.search(r'(따라서|그러므로|실제|올바른)\s*(정답은|정답:|답은|정답이)\s*\'?(\d)', expl)
            if match:
                found_num = int(match.group(3))
                if current_a != found_num and 1 <= found_num <= len(options):
                    q['a'] = found_num
                    fixed_count += 1
                    fixes.append(f"[{exam_key} Q{i+1}] Error Context Match: {current_a} -> {found_num} | {expl[:100]}")
                continue

        # General matches
        found_num = None
        match = re.search(r'(정답은|정답:|답은|정답이)\s*\'?(\d)', expl)
        if match:
            # Wait, if "정답: 2번은 오류", the match is 2.
            # We must NOT use this if it's followed by "오류"
            found_num = int(match.group(2))
            # Check context around the match
            start_idx = match.start()
            end_idx = match.end()
            context_after = expl[end_idx:end_idx+15]
            if "오류" in context_after or "잘못" in context_after:
                # It says it's an error. Look for the next number.
                match2 = re.search(r'(\d)번', expl[end_idx:])
                if match2:
                    found_num = int(match2.group(1))
        else:
            match = re.search(r'(\d)번이\s*정답', expl)
            if match:
                found_num = int(match.group(1))
            else:
                match = re.search(r'(\d)번이.*가장 명확', expl)
                if match:
                    found_num = int(match.group(1))

        if found_num and 1 <= found_num <= len(options):
            if current_a != found_num:
                # verify it's not actually claiming the current_a is wrong and another is right
                # If we got here, it's a normal pattern match
                q['a'] = found_num
                fixed_count += 1
                fixes.append(f"[{exam_key} Q{i+1}] Pattern Match: {current_a} -> {found_num} | {expl[:100]}")
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
            q['a'] = best_match_idx
            fixed_count += 1
            fixes.append(f"[{exam_key} Q{i+1}] Prefix Match: {current_a} -> {best_match_idx} | {expl[:100]}")

print(f"Total fixes applied: {fixed_count}")
for f in fixes[:50]:
    print(f)

with open('Sejong/SejongAttendance/public/questions_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
