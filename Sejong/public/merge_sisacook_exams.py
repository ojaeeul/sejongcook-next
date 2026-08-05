import json
import os

BASE_DIR = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
DATA_DIR = os.path.join(BASE_DIR, "data/sisacook")
SISA_FILE = os.path.join(DATA_DIR, "all_sisacook_exams.json")
QUESTIONS_JSON = os.path.join(BASE_DIR, "questions_data.json")
QUESTIONS_JS = os.path.join(BASE_DIR, "questions_data.js")
COURSES_JSON = os.path.join(BASE_DIR, "exam_courses.json")

def merge_questions():
    if not os.path.exists(SISA_FILE):
        print("Sisa exams file not found!")
        return []
        
    with open(SISA_FILE, "r", encoding="utf-8") as f:
        sisa_data = json.load(f)
        
    with open(QUESTIONS_JSON, "r", encoding="utf-8") as f:
        questions_data = json.load(f)
        
    # Merge
    for key, value in sisa_data.items():
        round_str = key.split(" ")[-1] if " " in key else key.split("_")[-1]
        suffix_map = {"1회": "가형", "2회": "나형", "3회": "다형", "4회": "라형", "5회": "마형"}
        mapped_suffix = suffix_map.get(round_str, round_str)
        
        if "제과" in key:
            new_key = f"제과기능사_사사쿡 제과기능사 {mapped_suffix}"
        else:
            new_key = f"제빵기능사_사사쿡 제빵기능사 {mapped_suffix}"
            
        questions_data[new_key] = value
        
    # Write back
    with open(QUESTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(questions_data, f, ensure_ascii=False, indent=2)
        
    with open(QUESTIONS_JS, "w", encoding="utf-8") as f:
        f.write("const questionsData = ")
        json.dump(questions_data, f, ensure_ascii=False, indent=2)
        f.write(";")
        
    print(f"Merged {len(sisa_data)} exams into questions_data.json and .js")
    return sisa_data.keys()

def update_courses(keys):
    with open(COURSES_JSON, "r", encoding="utf-8") as f:
        courses_data = json.load(f)
        
    category_target = None
    for cat in courses_data:
        if cat.get("category") == "제과제빵":
            category_target = cat
            break
            
    if not category_target:
        print("Category '제과제빵' not found!")
        return
        
    # Get target courses
    bakery_course = next((c for c in category_target["courses"] if type(c) == dict and c.get("name") == "제과기능사"), None)
    bread_course = next((c for c in category_target["courses"] if type(c) == dict and c.get("name") == "제빵기능사"), None)
    
    if not bakery_course or not bread_course:
        print("제과기능사 or 제빵기능사 course not found!")
        return

    # Clean existing SisaCook exams to avoid duplicates
    bakery_course["exams"] = [e for e in bakery_course.get("exams", []) if "사사쿡" not in e.get("name", "")]
    bread_course["exams"] = [e for e in bread_course.get("exams", []) if "사사쿡" not in e.get("name", "")]
    
    for key in sorted(keys):
        round_str = key.split(" ")[-1] if " " in key else key.split("_")[-1]
        suffix_map = {"1회": "가형", "2회": "나형", "3회": "다형", "4회": "라형", "5회": "마형"}
        mapped_suffix = suffix_map.get(round_str, round_str)
        
        if "제과" in key:
            new_key = f"제과기능사_사사쿡 제과기능사 {mapped_suffix}"
            bakery_course["exams"].append({"name": f"사사쿡 제과기능사 {mapped_suffix}", "key": new_key})
        elif "제빵" in key:
            new_key = f"제빵기능사_사사쿡 제빵기능사 {mapped_suffix}"
            bread_course["exams"].append({"name": f"사사쿡 제빵기능사 {mapped_suffix}", "key": new_key})
            
    # Remove old '사사쿡 제과', '사사쿡 제빵' courses if they exist
    category_target["courses"] = [c for c in category_target["courses"] if type(c) != dict or c.get("name") not in ["사사쿡 제과", "사사쿡 제빵"]]
    
    with open(COURSES_JSON, "w", encoding="utf-8") as f:
        json.dump(courses_data, f, ensure_ascii=False, indent=4)
        
    print("Updated exam_courses.json with Sisa exams directly into main courses")

if __name__ == "__main__":
    keys = merge_questions()
    if keys:
        update_courses(keys)
