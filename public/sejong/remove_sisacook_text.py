import json
import os

BASE_DIR = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public"
QUESTIONS_JSON = os.path.join(BASE_DIR, "questions_data.json")
QUESTIONS_JS = os.path.join(BASE_DIR, "questions_data.js")
COURSES_JSON = os.path.join(BASE_DIR, "exam_courses.json")

def replace_sisacook():
    # Fix questions_data.json
    with open(QUESTIONS_JSON, "r", encoding="utf-8") as f:
        questions_data = json.load(f)
        
    new_data = {}
    for key, value in questions_data.items():
        if "사사쿡" in key:
            new_key = key.replace("사사쿡 ", "").replace("사사쿡", "")
            new_data[new_key] = value
        else:
            new_data[key] = value
            
    with open(QUESTIONS_JSON, "w", encoding="utf-8") as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)
        
    with open(QUESTIONS_JS, "w", encoding="utf-8") as f:
        f.write("const questionsData = ")
        json.dump(new_data, f, ensure_ascii=False, indent=2)
        f.write(";")
        
    # Fix exam_courses.json
    with open(COURSES_JSON, "r", encoding="utf-8") as f:
        courses_data = json.load(f)
        
    for cat in courses_data:
        if cat.get("category") == "제과제빵":
            for course_name in ["제과기능사", "제빵기능사"]:
                course = next((c for c in cat["courses"] if type(c) == dict and c.get("name") == course_name), None)
                if course:
                    for exam in course.get("exams", []):
                        if "사사쿡" in exam.get("name", "") or "사사쿡" in exam.get("key", ""):
                            exam["name"] = exam["name"].replace("사사쿡 ", "").replace("사사쿡", "")
                            exam["key"] = exam["key"].replace("사사쿡 ", "").replace("사사쿡", "")
                            
    with open(COURSES_JSON, "w", encoding="utf-8") as f:
        json.dump(courses_data, f, ensure_ascii=False, indent=4)
        
    print("Removed '사사쿡' from names and keys successfully.")

if __name__ == "__main__":
    replace_sisacook()
