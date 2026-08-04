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
        questions_data[key] = value
        
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
        
    # Find category '제과제빵'
    category_target = None
    for cat in courses_data:
        if cat.get("category") == "제과제빵":
            category_target = cat
            break
            
    if not category_target:
        print("Category '제과제빵' not found!")
        return
        
    # Add '사사쿡 제과' and '사사쿡 제빵'
    bakery_exams = []
    bread_exams = []
    
    for key in sorted(keys):
        if "제과" in key:
            round_str = key.split("_")[-1]
            bakery_exams.append({"name": f"사사쿡 제과기능사 {round_str}", "key": key})
        elif "제빵" in key:
            round_str = key.split("_")[-1]
            bread_exams.append({"name": f"사사쿡 제빵기능사 {round_str}", "key": key})
            
    # Remove existing ones to prevent duplicates
    category_target["courses"] = [c for c in category_target["courses"] if type(c) == dict and c["name"] not in ["사사쿡 제과", "사사쿡 제빵"]]
    
    if bakery_exams:
        category_target["courses"].append({
            "name": "사사쿡 제과",
            "exams": bakery_exams
        })
    if bread_exams:
        category_target["courses"].append({
            "name": "사사쿡 제빵",
            "exams": bread_exams
        })
        
    with open(COURSES_JSON, "w", encoding="utf-8") as f:
        json.dump(courses_data, f, ensure_ascii=False, indent=4)
        
    print("Updated exam_courses.json with Sisa exams")

if __name__ == "__main__":
    keys = merge_questions()
    if keys:
        update_courses(keys)
