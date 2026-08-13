import json
import re

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

anomalies = []

# Suspicious endings that suggest truncation (particles and connectives)
suspicious_endings = ['은', '는', '이', '가', '을', '를', '에', '의', '로', '와', '과', '고', '며', '면', '서', '며,', '고,', '하', '되', '시키', '만들']

for exam_key, questions in data.items():
    for i, q in enumerate(questions):
        q_text = q.get('q', '').strip()
        options = q.get('o', [])
        
        # 1. Fewer than 4 options (unless it's a true/false or specifically allowed)
        if len(options) < 4:
            anomalies.append(f"[{exam_key} Q{i+1}] Has only {len(options)} options.")
        elif len(options) > 4:
            anomalies.append(f"[{exam_key} Q{i+1}] Has {len(options)} options (more than 4).")
            
        # 2. Empty options
        for j, opt in enumerate(options):
            opt_text = str(opt).strip()
            if not opt_text:
                anomalies.append(f"[{exam_key} Q{i+1}] Option {j+1} is EMPTY.")
            elif len(opt_text) == 1 and not opt_text.isdigit() and not opt_text.isalpha():
                anomalies.append(f"[{exam_key} Q{i+1}] Option {j+1} is very short: '{opt_text}'")
            else:
                # 3. Truncated endings
                last_char = opt_text[-1]
                if last_char in suspicious_endings:
                    # Ignore some valid short ones? "오븐에", "물로" might be valid options?
                    # Let's check if it's longer than 5 chars to avoid short valid nouns ending in '고' like '냉장고'.
                    if len(opt_text) > 5 and not opt_text.endswith('냉장고'):
                        anomalies.append(f"[{exam_key} Q{i+1}] Option {j+1} might be truncated: '{opt_text}'")
                        
        # 4. Truncated questions
        if q_text:
            last_char_q = q_text[-1]
            if last_char_q in suspicious_endings and len(q_text) > 10:
                anomalies.append(f"[{exam_key} Q{i+1}] Question might be truncated: '{q_text}'")

print(f"Total anomalies found: {len(anomalies)}")
for a in anomalies[:50]:
    print(a)

if len(anomalies) > 50:
    print(f"... and {len(anomalies) - 50} more anomalies.")
