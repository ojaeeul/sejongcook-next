import json
import os

COURSES_FILE = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam_courses.json"
KEYS_FILE = "temp_keys.json"

def main():
    with open(KEYS_FILE, 'r', encoding='utf-8') as f:
        keys_data = json.load(f)
        
    with open(COURSES_FILE, 'r', encoding='utf-8') as f:
        courses = json.load(f)
        
    # Check if category exists
    category_name = "한식조리기능사 (과거 기출복원)"
    category = next((c for c in courses if c['category'] == category_name), None)
    
    if not category:
        category = {
            "category": category_name,
            "exams": []
        }
        # Insert after "한식기능사" or at the end
        h_idx = next((i for i, c in enumerate(courses) if c['category'] == '한식기능사'), -1)
        if h_idx != -1:
            courses.insert(h_idx + 1, category)
        else:
            courses.append(category)
            
    existing_keys = {e['id'] for e in category['exams']}
    
    for k in keys_data:
        if k['key'] not in existing_keys:
            category['exams'].append({
                "id": k['key'],
                "title": k['name'].replace("(교사용)", "").replace("한식조리기능사", "한식기능사 ").replace("hcook_", "한식기능사 20")
            })
            
    with open(COURSES_FILE, 'w', encoding='utf-8') as f:
        json.dump(courses, f, ensure_ascii=False, indent=2)
        
    print(f"Added {len(keys_data)} exams to {category_name}.")

if __name__ == "__main__":
    main()
