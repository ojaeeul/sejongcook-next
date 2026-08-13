import json
import sys

try:
    with open('questions_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
        skipped_count = 0
        reasons = {'no_answer': 0, 'no_options': 0, 'invalid_answer': 0, 'other': 0}
        samples = []
        
        for course, questions in data.items():
            if isinstance(questions, list):
                for idx, q in enumerate(questions):
                    has_exp = q.get('e') and str(q['e']).strip() or q.get('explanation') and str(q['explanation']).strip()
                    if not has_exp:
                        skipped_count += 1
                        ans = q.get('a')
                        opts = q.get('o', [])
                        
                        reason = ''
                        if not ans:
                            reasons['no_answer'] += 1
                            reason = 'No answer (a)'
                        elif not isinstance(ans, int):
                            reasons['invalid_answer'] += 1
                            reason = f'Invalid answer type ({type(ans)})'
                        elif not opts:
                            reasons['no_options'] += 1
                            reason = 'No options (o)'
                        else:
                            reasons['other'] += 1
                            reason = 'Other'
                            
                        if len(samples) < 10:
                            question_text = q.get("q", "No question text")
                            question_text = (question_text[:30] + '...') if len(question_text) > 30 else question_text
                            samples.append(f'[{course} Q{idx+1}] {question_text} (Reason: {reason})')
            elif isinstance(questions, dict):
                for exam_id, exam in questions.items():
                    for idx, q in enumerate(exam.get('questions', [])):
                        has_exp = q.get('e') and str(q['e']).strip() or q.get('explanation') and str(q['explanation']).strip()
                        if not has_exp:
                            skipped_count += 1
                            ans = q.get('a')
                            opts = q.get('o', [])
                            
                            reason = ''
                            if not ans:
                                reasons['no_answer'] += 1
                                reason = 'No answer (a)'
                            elif not isinstance(ans, int):
                                reasons['invalid_answer'] += 1
                                reason = f'Invalid answer type ({type(ans)})'
                            elif not opts:
                                reasons['no_options'] += 1
                                reason = 'No options (o)'
                            else:
                                reasons['other'] += 1
                                reason = 'Other'
                                
                            if len(samples) < 10:
                                question_text = q.get("q", "No question text")
                                question_text = (question_text[:30] + '...') if len(question_text) > 30 else question_text
                                samples.append(f'[{course} Q{idx+1}] {question_text} (Reason: {reason})')
                            
        print(f'Total Skipped: {skipped_count}')
        print('Breakdown:', reasons)
        print('Samples:')
        for s in samples:
            print(s)
            
except Exception as e:
    print('Error:', e)
