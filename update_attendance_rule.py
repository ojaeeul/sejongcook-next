import os

file_path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/student/login.js"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_logic = """    for (const slotMins of slots) {
        if (currentMins >= (slotMins - 120) && currentMins <= (slotMins + 120)) {
            if (currentMins >= slotMins + 5) {
                return 'late';
            }
            const h = Math.floor(slotMins / 60);
            if (h === 10) return '10';
            if (h === 12) return '12';
            if (h === 14 || h === 2) return '2';
            if (h === 17 || h === 5) return '5';
            if (h === 19 || h === 7) return '7';
            return 'present';
        }
    }
    return 'invalid_time';"""

new_logic = """    // Find the closest slot to current time
    let closestSlot = slots[0];
    let minDiff = Math.abs(currentMins - slots[0]);
    
    for (let i = 1; i < slots.length; i++) {
        const diff = Math.abs(currentMins - slots[i]);
        if (diff < minDiff) {
            minDiff = diff;
            closestSlot = slots[i];
        }
    }

    // Determine status based on the closest slot, removing the "invalid_time" blockage
    if (currentMins >= closestSlot + 5) {
        return 'late';
    }
    const h = Math.floor(closestSlot / 60);
    if (h === 10) return '10';
    if (h === 12) return '12';
    if (h === 14 || h === 2) return '2';
    if (h === 17 || h === 5) return '5';
    if (h === 19 || h === 7) return '7';
    return 'present';"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Updated login.js logic")
else:
    print("Could not find the old logic block.")
