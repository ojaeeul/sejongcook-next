import json
import os
import shutil
from datetime import datetime
import re

DATA_FILE = 'data/members.json'
BACKUP_FILE = f'data/members_backup_v2_{datetime.now().strftime("%Y%m%d%H%M%S")}.json'

COURSE_MAPPING = {
    '제과+제빵': '제과제빵 기능사',
    '제과': '제과기능사',
    '제빵': '제빵기능사'
}

def fix_data():
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
        is_updated = False
        
        # 1. Update Course Names (specifically missed ones)
        course_str = member.get('course', '')
        if course_str:
            new_courses = []
            parts = [c.strip() for c in course_str.split(',')]
            courses_changed = False
            
            for p in parts:
                # Extract name and time
                match = re.match(r'^(.*?)(?:\(([^)]+)\))?$', p)
                if match:
                    name = match.group(1).strip()
                    time = match.group(2) # None if not present
                    
                    # Map name
                    if name in COURSE_MAPPING:
                        name = COURSE_MAPPING[name]
                        courses_changed = True
                    elif name == '한식' and '한식기능사' not in name:
                         # extra safety catch
                         name = '한식기능사'
                         courses_changed = True
                    # (Add others if paranoid, but previous script handled simple ones)

                    if time:
                        new_courses.append(f"{name}({time})")
                    else:
                        new_courses.append(name)
                else:
                    new_courses.append(p)
            
            if courses_changed:
                member['course'] = ', '.join(new_courses)
                is_updated = True

        # 2. Populate timeSlot if missing
        if 'timeSlot' not in member or not member['timeSlot']:
            # Extract times from course string
            times = []
            # Regex to find (HH:MM)
            matches = re.findall(r'\(([^)]+)\)', member.get('course', ''))
            for t in matches:
                # Validate it looks like time?
                if ':' in t:
                    times.append(t)
            
            if times:
                member['timeSlot'] = ','.join(times)
                is_updated = True

        if is_updated:
            updated_count += 1
            print(f"Updated member {member.get('name')}")

    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(members, f, ensure_ascii=False, indent=2)

    print(f"Fix completed. Updated {updated_count} records.")

if __name__ == "__main__":
    fix_data()
