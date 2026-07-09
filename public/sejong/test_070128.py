import os
import sys
from batch_parse_exams import parse_with_ai, extract_text_hwp, find_answer_file

TARGET_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/기출문제/hcook_070128.hwp"
ans_filepath = None
# You can see find_answer_file logic in batch_parse_exams.py, let's just see if there's a separate answer file.
# I'll just find it.
all_files = []
for root, _, files in os.walk("/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/기출문제"):
    for file in files:
        if file.lower().endswith('.hwp'):
            all_files.append(os.path.join(root, file))

ans_filepath = find_answer_file(TARGET_FILE, all_files)

print("Target:", TARGET_FILE)
print("Answer:", ans_filepath)

text = extract_text_hwp(TARGET_FILE)
if ans_filepath:
    text += "\n\n[별도 파일 정답지 내용]\n" + extract_text_hwp(ans_filepath)

questions = parse_with_ai(text)
print(f"Extracted: {len(questions)}")
if len(questions) > 0:
    print("Example:", questions[0])
