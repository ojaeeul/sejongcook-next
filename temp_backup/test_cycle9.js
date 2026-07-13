const isDueThisMonthLogic = (totalUpToLastMonth, thisMonthLogs) => {
    let rollingTotal = totalUpToLastMonth;
    let crossHits = [];

    // Test 1) 0.5 increment
    thisMonthLogs.forEach(log => {
        let prevRolling = rollingTotal;
        rollingTotal += 0.5; // (제과제빵)

        // 9일 날짜(즉, 1~9 채웠을 때 9가 되는 순간) 교차. 그 다음은 18이 되는 순간.
        if (rollingTotal >= 9 && Math.floor(prevRolling / 9) < Math.floor(rollingTotal / 9)) {
            crossHits.push({ type: '0.5', rollingTotal, day: log });
        }
    });

    return crossHits;
};

// Test 2) 1.0 increment
const isDueThisMonthLogic1 = (totalUpToLastMonth, thisMonthLogs) => {
    let rollingTotal = totalUpToLastMonth;
    let crossHits = [];

    // Test 2) 1.0 increment
    thisMonthLogs.forEach(log => {
        let prevRolling = rollingTotal;
        rollingTotal += 1.0;

        if (rollingTotal >= 9 && Math.floor(prevRolling / 9) < Math.floor(rollingTotal / 9)) {
            crossHits.push({ type: '1.0', rollingTotal, day: log });
        }
    });

    return crossHits;
};

console.log("0.5 increment (8.5 -> 9.0 -> 9.5 -> ...)");
let hits = isDueThisMonthLogic(8.0, [1, 2, 3, 4]);
console.log(hits); // Should hit at 9.0

hits = isDueThisMonthLogic(8.5, [1, 2, 3, 4]);
console.log(hits); // Should hit at 9.0

hits = isDueThisMonthLogic(17.5, [1, 2, 3, 4]);
console.log(hits); // Should hit at 18.0

console.log("\n1.0 increment (8.0 -> 9.0 -> 10.0 -> ...)");
let hits2 = isDueThisMonthLogic1(8.0, [1, 2, 3, 4]);
console.log(hits2); // Should hit at 9.0

hits2 = isDueThisMonthLogic1(17.0, [1, 2, 3, 4]);
console.log(hits2); // Should hit at 18.0
