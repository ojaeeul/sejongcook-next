import json
import unicodedata
from collections import defaultdict, Counter

DATA_PATH = "questions_data.json"

def normalize(text): return unicodedata.normalize('NFC', text)

def main():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        q_data = json.load(f)

    # Collect answers for all base bank questions
    ans_collector = defaultdict(list)
    
    for k, questions in q_data.items():
        if '시험지' not in k:
            for q in questions:
                q_text = normalize(q.get('q', '').strip())
                ans = q.get('a')
                if ans and isinstance(ans, int) and 1 <= ans <= 4:
                    ans_collector[q_text].append(ans)

    resolved_answers = {}
    conflict_count = 0
    for q_text, ans_list in ans_collector.items():
        if len(set(ans_list)) > 1:
            conflict_count += 1
            counter = Counter(ans_list)
            # Pick the most common answer. In case of a tie, most_common(1) returns an arbitrary tied element.
            best_ans = counter.most_common(1)[0][0]
            resolved_answers[q_text] = best_ans

    print(f"Found {conflict_count} conflicting questions. Resolving by frequency...")

    # Update q_data with resolved answers
    updated_count = 0
    for k, questions in q_data.items():
        if '시험지' not in k:
            for q in questions:
                q_text = normalize(q.get('q', '').strip())
                if q_text in resolved_answers:
                    correct_ans = resolved_answers[q_text]
                    if q.get('a') != correct_ans:
                        q['a'] = correct_ans
                        updated_count += 1

    print(f"Updated {updated_count} answers in base bank.")

    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(q_data, f, ensure_ascii=False, indent=2)
        
    print("Saved questions_data.json.")

if __name__ == "__main__":
    main()
