import os
import re

file_path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/shared_calc.js"

with open(file_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

# Add the loadCycleSettings and window.sejongCycleRules at the top
header_injection = """
window.sejongCycleRules = {
    default: 9,
    custom: [
        { keyword: "제과제빵", cycle: 17 }
    ]
};

window.loadCycleSettings = async function() {
    try {
        const res = await fetch('/api/sejong/settings');
        if (res.ok) {
            const data = await res.json();
            if (data && data.cycleRules) {
                window.sejongCycleRules = data.cycleRules;
            }
        }
    } catch(e) {
        console.error("Failed to load cycle settings:", e);
    }
};

window.getCourseCycleLength = function(courseNameScope) {
    if (!courseNameScope) return window.sejongCycleRules.default;
    
    if (window.sejongCycleRules && window.sejongCycleRules.custom) {
        for (const rule of window.sejongCycleRules.custom) {
            if (courseNameScope.includes(rule.keyword)) {
                return rule.cycle;
            }
        }
    }
    return window.sejongCycleRules ? window.sejongCycleRules.default : 9;
};
"""

js_content = re.sub(r'(\nwindow\.calculateRedBoxesForMonth = function)', header_injection + r'\1', js_content, count=1)

# Modify getCycle function logic
old_getCycle = """    const getCycle = (val) => {
        let vRaw = Math.round(val * 10);
        if (isDualCourse) {
            if (vRaw < 170) return 0;
            return Math.floor((vRaw - 170) / 160) + 1;
        } else {
            if (vRaw < 90) return 0;
            return Math.floor((vRaw - 90) / 80) + 1;
        }
    };"""

new_getCycle = """    const getCycle = (val) => {
        let vRaw = Math.round(val * 10);
        let cycleLimit = window.getCourseCycleLength(courseFilter || String(member.course));
        let firstLimit = cycleLimit * 10;
        let step = (cycleLimit - 1) * 10;
        if (step <= 0) step = 10; // safety fallback
        
        if (vRaw < firstLimit) return 0;
        return Math.floor((vRaw - firstLimit) / step) + 1;
    };"""

js_content = js_content.replace(old_getCycle, new_getCycle)

# Fix the currentCount return payload target
js_content = js_content.replace(
    "currentCount: { count: carryOverP, target: isDualCourse ? 17 : 9 }",
    "currentCount: { count: carryOverP, target: window.getCourseCycleLength(courseFilter || String(member.course)) }"
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(js_content)
    
print("Successfully updated shared_calc.js to support dynamic cycle settings.")
