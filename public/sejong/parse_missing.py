import json
import os
import subprocess
import re
import unicodedata

def normalize(text):
    return unicodedata.normalize('NFC', text)

with open('questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

hwp_dir = normalize('/Users/ojaeeul/Downloads/제과제빵필기')

hwp_files = {}
for root, dirs, files in os.walk(hwp_dir):
    for file in files:
        if file.endswith('.hwp'):
            hwp_files[normalize(file)] = os.path.join(root, file)

total_added = 0

for exam_key, questions in data.items():
    if isinstance(questions, list):
        if len(questions) < 60 and exam_key.endswith('.hwp'):
            original_filename = exam_key
            if original_filename.startswith('오재을_제과제빵_'):
                original_filename = original_filename.replace('오재을_제과제빵_', '')
            
            norm_filename = normalize(original_filename)
            
            hwp_path = None
            if norm_filename in hwp_files:
                hwp_path = hwp_files[norm_filename]
            else:
                for k, v in hwp_files.items():
                    if norm_filename in k or k in norm_filename:
                        hwp_path = v
                        break
                        
            if hwp_path:
                print(f"Parsing missing questions for {exam_key} (Current length: {len(questions)})...")
                try:
                    text = subprocess.check_output(['hwp5txt', hwp_path], stderr=subprocess.STDOUT, timeout=10).decode('utf-8')
                    
                    start_q_num = len(questions) + 1
                    added_for_this = 0
                    
                    for q_num in range(start_q_num, 61):
                        pattern = rf'(?:^|\n)\s*{q_num}\s*[\.\)](.*?)(?:(?=\n\s*{q_num+1}\s*[\.\)])|(?=\n\s*61\s*[\.\)])|$)'
                        match = re.search(pattern, text, re.DOTALL)
                        
                        if match:
                            q_text_block = match.group(1).strip()
                            opt_pattern = r'(가[\.\)]|①)\s*(.*)'
                            opt_search = re.search(opt_pattern, q_text_block, re.DOTALL)
                            
                            if opt_search:
                                q_body = q_text_block[:opt_search.start()].strip()
                                opts_block = q_text_block[opt_search.start():].strip()
                            else:
                                q_body = q_text_block
                                opts_block = ""
                                
                            question_text = f"{q_num}. {q_body}"
                            options = []
                            if opts_block:
                                markers = re.finditer(r'(?:가|나|다|라|①|②|③|④)[\.\)]', opts_block)
                                marker_indices = [m.start() for m in markers]
                                
                                for i in range(len(marker_indices)):
                                    start_idx = marker_indices[i]
                                    marker_len = 2
                                    
                                    if i < len(marker_indices) - 1:
                                        end_idx = marker_indices[i+1]
                                        opt_text = opts_block[start_idx+marker_len:end_idx].strip()
                                    else:
                                        opt_text = opts_block[start_idx+marker_len:].strip()
                                        
                                    options.append(re.sub(r'\s+', ' ', opt_text))
                                    
                            while len(options) < 4:
                                options.append("보기 미제공")
                                
                            questions.append({
                                "question": question_text,
                                "options": options[:4],
                                "answer": "정답 미제공"
                            })
                            added_for_this += 1
                            total_added += 1
                        else:
                            print(f"  Warning: Question {q_num} not found in {norm_filename}")
                            break
                            
                    print(f"  Added {added_for_this} questions. New length: {len(questions)}")
                except Exception as e:
                    print(f"  Error parsing {hwp_path}: {e}")
            else:
                print(f"HWP file not found for {exam_key} (tried {norm_filename})")

print(f"Total missing questions added: {total_added}")

with open('questions_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)
    
print("Updated questions_data.json")
