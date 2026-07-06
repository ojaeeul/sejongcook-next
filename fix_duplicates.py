import json, re

def normalize_text(text):
    t = re.sub(r'^[\d①-⑳가-하a-zA-Z]+[\.\)]?\s*', '', str(text))
    t = re.sub(r'[\s\W_]+', '', t)
    return t

def main():
    with open("Sejong/SejongAttendance/public/questions_data.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    existing_questions = set()
    total_dupes = 0
    total = 0

    for cat in sorted(data.keys()):
        qlist = data[cat]
        if not isinstance(qlist, list):
            continue
            
        for i, q_obj in enumerate(qlist):
            total += 1
            q_text = q_obj.get("q", "")
            if not q_text or "[중복" in q_text:
                continue
                
            norm = normalize_text(q_text)
            if norm and norm in existing_questions:
                # Duplicate!
                data[cat][i] = {
                    "q": "[중복 문항으로 삭제되었습니다]",
                    "o": ["-", "-", "-", "-"],
                    "a": ""
                }
                total_dupes += 1
            else:
                existing_questions.add(norm)

    print(f"Fixed duplicates. Total questions: {total}, Duplicates removed: {total_dupes}")
    
    with open("Sejong/SejongAttendance/public/questions_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
