import json
import re

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

report = ["# 해설지-정답 불일치 의심 문항 리포트\n"]
report.append("현재 데이터베이스를 스캔하여 **설정된 정답**과 **해설지가 가리키는 내용**이 다를 수 있는 의심 문항들을 추출했습니다.\n")
report.append("대부분 이미 수정되었으나, 일부 특이한 문맥(예: '1번은 오답입니다' 등)으로 인해 남은 문항들입니다.\n\n")

count = 0
for exam_key, questions in data.items():
    for i, q in enumerate(questions):
        if 'e' not in q or not q['e'] or 'a' not in q or not q['o']:
            continue
            
        current_a = q['a']
        expl = q['e']
        options = q['o']
        
        found_nums = set()
        
        matches = re.finditer(r'(정답|답)[^\d]{0,10}(\d)', expl)
        for m in matches:
            found_nums.add(int(m.group(2)))
            
        matches2 = re.finditer(r'(\d)번이\s*(정답|답)', expl)
        for m in matches2:
            found_nums.add(int(m.group(1)))
            
        matches3 = re.finditer(r'(정답|답)이\s*\'?(\d)\'?번', expl)
        for m in matches3:
            found_nums.add(int(m.group(2)))
            
        best_match_idx = -1
        expl_prefix = expl[:30] 
        for idx, opt in enumerate(options):
            if not opt: continue
            opt_str = str(opt).strip()
            if len(opt_str) > 2 and opt_str in expl_prefix:
                best_match_idx = idx + 1
                break
                
        suspicious = False
        reason = ""
        
        if best_match_idx != -1 and current_a != best_match_idx:
             if "오답" not in expl_prefix and "아닙" not in expl_prefix and "틀린" not in expl_prefix and "오류" not in expl_prefix:
                 suspicious = True
                 reason = f"해설이 '{options[best_match_idx-1]}' 로 시작하지만, 현재 정답은 {current_a}번입니다."
                 
        valid_found_nums = [n for n in found_nums if 1 <= n <= len(options)]
        if not suspicious and valid_found_nums:
            if current_a not in valid_found_nums:
                suspicious = True
                reason = f"해설에서 언급된 정답 번호({valid_found_nums})와 현재 설정된 정답({current_a}번)이 다릅니다."

        # 제외 조건: 해설에 "X번이 아니라 Y번입니다" 같은 경우 현재 답이 Y번이라면 정상
        if suspicious:
             # 추가 필터링
             if current_a == 4 and "1번이 아니라" in expl and "4번" in expl: suspicious = False
             
        if suspicious:
            count += 1
            report.append(f"### {exam_key} - {i+1}번 문제")
            report.append(f"**문제:** {q.get('q', '')}")
            for j, opt in enumerate(options):
                mark = "✅ (현재 설정된 정답)" if j + 1 == current_a else ""
                report.append(f"- {j+1}번: {opt} {mark}")
            report.append(f"\n**의심 사유:** {reason}")
            report.append(f"\n**해설 내용:**\n> {expl}\n")
            report.append("---\n")

report.insert(2, f"**총 발견된 의심 문항 수: {count}개**\n\n")

with open('/Users/ojaeeul/.gemini/antigravity-ide/brain/4786c309-387e-483a-9939-0851dcd658a2/discrepancy_report.md', 'w', encoding='utf-8') as f:
    f.write("\n".join(report))
