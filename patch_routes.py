import os

# Patch route.ts (single attendance)
filepath_single = "app/api/sejong/attendance/route.ts"
if os.path.exists(filepath_single):
    with open(filepath_single, "r", encoding="utf-8") as f:
        content = f.read()
    
    old_logic = """            if (data.course) {
                delQuery = delQuery.eq('course', data.course);
            } else {
                delQuery = delQuery.is('course', null);
            }"""
    
    new_logic = """            if (data.course === 'ALL') {
                // Delete all courses for this member and date
            } else if (data.course) {
                delQuery = delQuery.eq('course', data.course);
            } else {
                delQuery = delQuery.is('course', null);
            }"""
    
    if old_logic in content:
        content = content.replace(old_logic, new_logic)
        with open(filepath_single, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Patched {filepath_single}")

# Patch batch/route.ts (batch attendance)
filepath_batch = "app/api/sejong/attendance/batch/route.ts"
if os.path.exists(filepath_batch):
    with open(filepath_batch, "r", encoding="utf-8") as f:
        content = f.read()
    
    old_logic_batch = """        if (course) {
            delQuery = delQuery.eq('course', course);
        } else {
            delQuery = delQuery.is('course', null);
        }"""
        
    new_logic_batch = """        if (course === 'ALL') {
            // Delete all
        } else if (course) {
            delQuery = delQuery.eq('course', course);
        } else {
            delQuery = delQuery.is('course', null);
        }"""
    
    if old_logic_batch in content:
        content = content.replace(old_logic_batch, new_logic_batch)
        with open(filepath_batch, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Patched {filepath_batch}")
