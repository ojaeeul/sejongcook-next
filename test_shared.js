const fs = require('fs');
const path = './public/sejong/shared_calc.js';

// Mock browser env
global.window = {};

const scriptContent = fs.readFileSync(path, 'utf8');
eval(scriptContent);

const member = { id: '123', course: '제과제빵기능사', start_date: '2026-01-01' };
const attendanceLogs = [
  { memberId: '123', date: '2026-06-01', status: 'present', course: '제과제빵기능사' },
  { memberId: '123', date: '2026-06-05', status: 'present', course: '제과제빵기능사' }
];
const GLOBAL_DATA_ADJUSTMENTS = {};

const result = window.calculateRedBoxesForMonth(member, 2026, 6, attendanceLogs, null, GLOBAL_DATA_ADJUSTMENTS);
console.log(result);
