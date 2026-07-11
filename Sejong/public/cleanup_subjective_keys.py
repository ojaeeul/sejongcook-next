import json
import os

QUESTIONS_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/questions_data.json"
EXAM_COURSES_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam_courses.json"

def main():
    if os.path.exists(QUESTIONS_FILE):
        with open(QUESTIONS_FILE, 'r', encoding='utf-8') as f:
            qdata = json.load(f)
            
        keys_to_delete = [k for k in qdata.keys() if k.startswith('주관식_')]
        for k in keys_to_delete:
            del qdata[k]
            print(f"Deleted old key: {k}")
            
        with open(QUESTIONS_FILE, 'w', encoding='utf-8') as f:
            json.dump(qdata, f, ensure_ascii=False, indent=2)
            
    if os.path.exists(EXAM_COURSES_FILE):
        with open(EXAM_COURSES_FILE, 'r', encoding='utf-8') as f:
            ec = json.load(f)
            
        # find category "전체과정"
        cat_all = next((cat for cat in ec if cat.get('category') == '전체과정'), None)
        if cat_all:
            subj_course = next((c for c in cat_all.get('courses', []) if c.get('name') == '오재을(주관식)'), None)
            if subj_course:
                # Remove any exam that starts with '주관식_'
                subj_course['exams'] = [ex for ex in subj_course['exams'] if not ex['key'].startswith('주관식_')]
                print("Cleaned up exam_courses.json")
                
        with open(EXAM_COURSES_FILE, 'w', encoding='utf-8') as f:
            json.dump(ec, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    main()
