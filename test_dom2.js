const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf-8');

const dom = new JSDOM(html, { url: "http://localhost/", runScripts: "dangerously" });
dom.window.localStorage.setItem('sejong_ledger_sync', '{}');

dom.window.addEventListener('error', (event) => {
    console.error("Caught runtime error:", event.error);
});
setTimeout(() => {
    console.log("Done checking for errors.");
}, 1000);
