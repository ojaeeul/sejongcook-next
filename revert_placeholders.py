import json

QUESTIONS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"

def main():
    print("Loading DB...")
    with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
        db = json.load(f)
        
    updated = 0
    for key, qlist in db.items():
        if not isinstance(qlist, list): continue
        
        # Filter out placeholders
        original_len = len(qlist)
        new_qlist = [q for q in qlist if not q.get('q', '').startswith('원본 파일 오류로 누락된 문항입니다')]
        
        if len(new_qlist) < original_len:
            db[key] = new_qlist
            updated += 1
            print(f"[{key}] Removed {original_len - len(new_qlist)} placeholders. Now has {len(new_qlist)} questions.")
            
    if updated > 0:
        with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(db, f, ensure_ascii=False, indent=2)
        print(f"\nSaved database. Reverted placeholders in {updated} exams.")
    else:
        print("No placeholders found.")

if __name__ == "__main__":
    main()
