import json
import os

BASE_DIR = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
QUESTIONS_JSON = os.path.join(BASE_DIR, "questions_data.json")
QUESTIONS_JS = os.path.join(BASE_DIR, "questions_data.js")
COURSES_JSON = os.path.join(BASE_DIR, "exam_courses.json")

def fix_keys():
    with open(QUESTIONS_JSON, "r", encoding="utf-8") as f:
        questions_data = json.load(f)
        
    keys_to_delete = []
    new_data = {}
    
    for old_key, value in questions_data.items():
        if old_key in [f"제과기능사 {i}회" for i in range(1, 6)] or old_key in [f"제빵기능사 {i}회" for i in range(1, 6)]:
            round_str = old_key.split(" ")[-1]
            suffix_map = {"1회": "가형", "2회": "나형", "3회": "다형", "4회": "라형", "5회": "마형"}
            mapped_suffix = suffix_map.get(round_str, round_str)
            
            if "제과" in old_key:
                new_key = f"제과기능사_제과기능사 {mapped_suffix}"
            else:
                new_key = f"제빵기능사_제빵기능사 {mapped_suffix}"
                
            new_data[new_key] = value
            keys_to_delete.append(old_key)
            
    for k in keys_to_delete:
        del questions_data[k]
        
    for k, v in new_data.items():
        questions_data[k] = v
        
    with open(QUESTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(questions_data, f, ensure_ascii=False, indent=2)
        
    with open(QUESTIONS_JS, "w", encoding="utf-8") as f:
        f.write("const questionsData = ")
        json.dump(questions_data, f, ensure_ascii=False, indent=2)
        f.write(";")
        
    print(f"Fixed {len(keys_to_delete)} keys in questions_data.json")
    
    # Now fix exam_courses.json
    with open(COURSES_JSON, "r", encoding="utf-8") as f:
        courses_data = json.load(f)
        
    for cat in courses_data:
        if cat.get("category") == "제과제빵":
            bakery_course = next((c for c in cat["courses"] if type(c) == dict and c.get("name") == "제과기능사"), None)
            bread_course = next((c for c in cat["courses"] if type(c) == dict and c.get("name") == "제빵기능사"), None)
            
            if bakery_course:
                for exam in bakery_course.get("exams", []):
                    if exam.get("key") in keys_to_delete:
                        round_str = exam["key"].split(" ")[-1]
                        suffix_map = {"1회": "가형", "2회": "나형", "3회": "다형", "4회": "라형", "5회": "마형"}
                        mapped_suffix = suffix_map.get(round_str, round_str)
                        exam["key"] = f"제과기능사_제과기능사 {mapped_suffix}"
                        exam["name"] = f"제과기능사 {mapped_suffix}"
                        
            if bread_course:
                for exam in bread_course.get("exams", []):
                    if exam.get("key") in keys_to_delete:
                        round_str = exam["key"].split(" ")[-1]
                        suffix_map = {"1회": "가형", "2회": "나형", "3회": "다형", "4회": "라형", "5회": "마형"}
                        mapped_suffix = suffix_map.get(round_str, round_str)
                        exam["key"] = f"제빵기능사_제빵기능사 {mapped_suffix}"
                        exam["name"] = f"제빵기능사 {mapped_suffix}"
                        
    with open(COURSES_JSON, "w", encoding="utf-8") as f:
        json.dump(courses_data, f, ensure_ascii=False, indent=4)
        
    print("Fixed exam_courses.json keys as well")

if __name__ == "__main__":
    fix_keys()
