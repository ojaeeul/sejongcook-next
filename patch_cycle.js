const fs = require('fs');
const file = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/cycle_settings.html';
let content = fs.readFileSync(file, 'utf8');

// Add auto-initialization for 일식기능사 and 중식기능사
let initSearch = `            if (!cycleRules.custom.find(r => r.keyword === "제과제빵")) {
                cycleRules.custom.push({ keyword: "제과제빵", cycle: 17 });
            }`;
let initReplace = `            if (!cycleRules.custom.find(r => r.keyword === "제과제빵")) {
                cycleRules.custom.push({ keyword: "제과제빵", cycle: 17 });
            }
            if (!cycleRules.custom.find(r => r.keyword === "일식기능사")) {
                cycleRules.custom.push({ keyword: "일식기능사", cycle: 10, cycle_student: 9, group: 'custom' });
            }
            if (!cycleRules.custom.find(r => r.keyword === "중식기능사")) {
                cycleRules.custom.push({ keyword: "중식기능사", cycle: 10, cycle_student: 9, group: 'custom' });
            }`;
content = content.replace(initSearch, initReplace);

// Update UI to show cycle_student
let uiSearch = `<div style="color:#475569; font-size:1.1rem; font-weight: 500;">
                                출석 <input type="number" value="\${rule.cycle}" class="cycle-input" onchange="updateCustomCycle('\${escKeyword}', this.value)" min="1" style="width: 70px; padding: 6px; text-align: center; border: 1px solid #cbd5e1; border-radius: 6px; margin: 0 8px; font-weight: bold;"> 회
                            </div>`;
let uiReplace = `<div style="color:#475569; font-size:1.0rem; font-weight: 500;">
                                일반 <input type="number" value="\${rule.cycle}" class="cycle-input" onchange="updateCustomCycle('\${escKeyword}', this.value, 'general')" min="1" style="width: 55px; padding: 6px; text-align: center; border: 1px solid #cbd5e1; border-radius: 6px; margin: 0 4px; font-weight: bold;">회 
                                <span style="color:#cbd5e1;">|</span>
                                학생 <input type="number" value="\${rule.cycle_student !== undefined ? rule.cycle_student : rule.cycle}" class="cycle-input" onchange="updateCustomCycle('\${escKeyword}', this.value, 'student')" min="1" style="width: 55px; padding: 6px; text-align: center; border: 1px solid #cbd5e1; border-radius: 6px; margin: 0 4px; font-weight: bold;">회
                            </div>`;
content = content.replace(uiSearch, uiReplace);

// Update updateCustomCycle function
let updateSearch = `    function updateCustomCycle(keyword, val) {
        let cycle = parseInt(val);
        if (isNaN(cycle) || cycle <= 0) cycle = 1;
        const rule = cycleRules.custom.find(r => r.keyword === keyword);
        if (rule) rule.cycle = cycle;
    }`;
let updateReplace = `    function updateCustomCycle(keyword, val, type = 'general') {
        let cycle = parseInt(val);
        if (isNaN(cycle) || cycle <= 0) cycle = 1;
        const rule = cycleRules.custom.find(r => r.keyword === keyword);
        if (rule) {
            if (type === 'student') rule.cycle_student = cycle;
            else rule.cycle = cycle;
        }
    }`;
content = content.replace(updateSearch, updateReplace);

fs.writeFileSync(file, content);
