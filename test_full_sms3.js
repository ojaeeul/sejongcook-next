const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const htmlCode = fs.readFileSync('public/sejong/sms.html', 'utf8');
const sharedCalcCode = fs.readFileSync('public/sejong/shared_calc.js', 'utf8');
let smsV3Code = fs.readFileSync('public/sejong/sms_v3.js', 'utf8');

// remove localStorage from smsV3Code to avoid JSDOM error
smsV3Code = smsV3Code.replace(/localStorage\.getItem/g, '(() => null)');
smsV3Code = smsV3Code.replace(/localStorage\.setItem/g, '(() => null)');
smsV3Code = smsV3Code.replace(/localStorage\.removeItem/g, '(() => null)');
smsV3Code = smsV3Code.replace(/localStorage/g, '{}');

smsV3Code = smsV3Code.replace(/grid\.innerHTML = '';/g, `grid.innerHTML = ''; console.log('GRID CLEARED');`);
smsV3Code = smsV3Code.replace(/const startVal =/g, `console.log('REACHED startVal'); const startVal =`);
smsV3Code = smsV3Code.replace(/allMembers\.forEach\(m => \{/g, `console.log('REACHED allMembers'); allMembers.forEach(m => {`);
smsV3Code = smsV3Code.replace(/const today = new Date\(\);/g, `console.log('REACHED today'); const today = new Date();`);
smsV3Code = smsV3Code.replace(/for \(let i = firstDay; i > 0; i--\) \{/g, `console.log('REACHED loop 1, firstDay=', firstDay); for (let i = firstDay; i > 0; i--) {`);
smsV3Code = smsV3Code.replace(/for \(let i = 1; i <= lastDate; i\+\+\) \{/g, `console.log('REACHED loop 2, lastDate=', lastDate); for (let i = 1; i <= lastDate; i++) {`);
smsV3Code = smsV3Code.replace(/grid\.appendChild\(d\);/g, `console.log('APPENDED A DAY'); grid.appendChild(d);`);

const dom = new JSDOM(htmlCode, { url: "http://localhost:3000/sejong/sms.html", runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

window.electronAPI = {
    loadMembers: async () => [{ id: '1770517014506', name: '홍길동', course: '한식기능사', registeredDate: '2026-02-08' }],
    loadPayments: async () => [],
    loadAttendance: async () => [],
    loadHolidays: async () => [],
    loadSchedules: async () => ({})
};
window.fetch = async () => ({ text: async () => '' });

const script1 = document.createElement('script');
script1.textContent = sharedCalcCode;
document.body.appendChild(script1);

const script2 = document.createElement('script');
script2.textContent = smsV3Code;
document.body.appendChild(script2);

setTimeout(async () => {
    try {
        await window.fetchAllData();
        console.log("calendarDays innerHTML length:", document.getElementById('calendarDays').innerHTML.length);
    } catch(e) {
        console.log("CRASH IN FETCH:", e);
    }
}, 1000);
