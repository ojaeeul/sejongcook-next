let allKnownCourses = ["바리스타", "제과제빵", "양식기능사"];
let cycleRules = {
    default: 9,
    custom: [
        { keyword: "제과제빵", cycle: 17, group: "baking" },
        { keyword: "바리스타", cycle: 9, group: "custom" }
    ]
};

function isBakingCourse(c) {
    return c.includes('제과') || c.includes('제빵');
}

function syncGroupCycles() {
    // mock
}

function quickMove(courseName, dest) {
    if (!allKnownCourses.includes(courseName)) {
        allKnownCourses.push(courseName);
    }

    syncGroupCycles();
    const defCycle = cycleRules.default;
    let bakingRule = cycleRules.custom.find(r => r.keyword === "제과제빵");
    const bakCycle = bakingRule ? bakingRule.cycle : 17;

    // 기존 룰 제거
    cycleRules.custom = cycleRules.custom.filter(r => r.keyword !== courseName);

    if (dest === 'custom') {
        let initCycle = isBakingCourse(courseName) ? bakCycle : defCycle;
        cycleRules.custom.push({ keyword: courseName, cycle: initCycle, group: 'custom' });
    } else if (dest === 'general') {
        if (isBakingCourse(courseName)) {
            cycleRules.custom.push({ keyword: courseName, cycle: defCycle, group: 'general' });
        }
    } else if (dest === 'baking') {
        if (!isBakingCourse(courseName)) {
            cycleRules.custom.push({ keyword: courseName, cycle: bakCycle, group: 'baking' });
        }
    } else if (dest === 'auto') {
        // auto
    }
}

function renderUI() {
    let generalCourses = [];
    let bakingCourses = [];
    let customRules = [];
    
    let allItems = new Set([...allKnownCourses, ...cycleRules.custom.map(r => r.keyword)]);
    allItems.delete("제과제빵");

    allItems.forEach(c => {
        let rule = cycleRules.custom.find(r => r.keyword === c);
        
        if (rule) {
            if (rule.group === 'general') generalCourses.push(c);
            else if (rule.group === 'baking') bakingCourses.push(c);
            else customRules.push(rule);
        } else {
            if (isBakingCourse(c)) bakingCourses.push(c);
            else generalCourses.push(c);
        }
    });

    console.log("General:", generalCourses);
    console.log("Baking:", bakingCourses);
    console.log("Custom:", customRules.map(r => r.keyword));
}

console.log("Initial state:");
renderUI();

console.log("\nMoving '바리스타' to general:");
quickMove("바리스타", "general");
renderUI();

console.log("\nMoving '양식기능사' to custom:");
quickMove("양식기능사", "custom");
renderUI();

