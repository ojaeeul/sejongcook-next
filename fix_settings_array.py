import os

path = "/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/cycle_settings.html"

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace loadSettings
old_load = """            if (res.ok) {
                globalSettings = await res.json();
                if (globalSettings.cycleRules) {
                    cycleRules = globalSettings.cycleRules;
                }
            }"""
new_load = """            if (res.ok) {
                globalSettings = await res.json();
                let target = Array.isArray(globalSettings) ? (globalSettings[0] || {}) : globalSettings;
                if (target.cycleRules) {
                    cycleRules = target.cycleRules;
                }
            }"""
content = content.replace(old_load, new_load)

# Replace saveCycleSettings
old_save = """        cycleRules.default = defaultCycle;
        
        globalSettings.cycleRules = cycleRules;"""
new_save = """        cycleRules.default = defaultCycle;
        
        if (Array.isArray(globalSettings)) {
            if (globalSettings.length === 0) globalSettings.push({});
            globalSettings[0].cycleRules = cycleRules;
        } else {
            globalSettings.cycleRules = cycleRules;
        }"""
content = content.replace(old_save, new_save)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed array issue in cycle_settings.html")
