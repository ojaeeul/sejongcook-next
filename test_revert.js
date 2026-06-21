const fs = require('fs');
let runningTotal = 20; // assumed
let trigger = 9;
let limit = 9;
let cycleCount = 2;

let displayMakeup = (trigger + limit * (cycleCount - 1));
let displayP = runningTotal - displayMakeup;
console.log(`displayP: ${displayP}`);
