import json
import os
import shutil
from datetime import datetime

DATA_FILE = 'data/members.json'
BACKUP_FILE = f'data/members_backup_{datetime.now().strftime("%Y%m%d%H%M%S")}.json'

COURSE_MAPPING = {
    '한식': '한식기능사',
    '양식': '양식기능사',
    '일식': '일식기능사',
    '중식': '중식기능사',
    '제과': '제과기능사',
    '제빵': '제빵기능사'
}

def migrate_data():
    if not os.path.exists(DATA_FILE):
        print(f"File not found: {DATA_FILE}")
        return

    # Backup
    shutil.copy(DATA_FILE, BACKUP_FILE)
    print(f"Backup created: {BACKUP_FILE}")

    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        members = json.load(f)

    updated_count = 0
    for member in members:
        original_course_str = member.get('course', '')
        if not original_course_str:
            continue

        # Handle multiple courses (comma separated)
        courses = [c.strip() for c in original_course_str.split(',')]
        new_courses = []
        is_updated = False

        for course_entry in courses:
            # course_entry format: "Name(Time)" or just "Name"
            if '(' in course_entry:
                name_part = course_entry.split('(')[0].strip()
                time_part = course_entry.split('(')[1].replace(')', '').strip()
            else:
                name_part = course_entry.strip()
                time_part = ''

            # Map name if exists
            new_name = COURSE_MAPPING.get(name_part, name_part)
            
            if new_name != name_part:
                is_updated = True
            
            # Reconstruct
            if time_part:
                new_courses.append(f"{new_name}({time_part})")
            else:
                new_courses.append(new_name)

        if is_updated:
            member['course'] = ', '.join(new_courses)
            updated_count += 1
            print(f"Updated member {member.get('name')}: {original_course_str} -> {member['course']}")

        # Also migrate 'course_select' field if it exists (legacy field)
        if 'course_select' in member:
             legacy_course = member['course_select']
             if legacy_course in COURSE_MAPPING:
                 member['course_select'] = COURSE_MAPPING[legacy_course]

    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(members, f, ensure_ascii=False, indent=2)

    print(f"Migration completed. Updated {updated_count} records.")

if __name__ == "__main__":
    migrate_data()
