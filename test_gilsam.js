const fs = require('fs');

// Dummy test to see what getCycle and displayMakeup would do if runningTotal is 19 vs 21
let limit = 9;
let trigger = 9;

function test(runningTotal) {
    let cycleCount = 0;
    if (runningTotal >= trigger) {
        cycleCount = Math.floor((runningTotal - trigger) / limit) + 1;
    }
    let displayMakeup = cycleCount === 0 ? 0 : trigger + limit * (cycleCount - 1);
    let displayP = runningTotal - displayMakeup;
    console.log(`Total: ${runningTotal} => cycleCount: ${cycleCount}, makeup: ${displayMakeup}, P: ${displayP}`);
}

test(19);
test(21);
