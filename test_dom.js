const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf-8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
dom.window.addEventListener('error', (event) => {
    console.error("Caught error:", event.error);
});
setTimeout(() => {
    console.log("Done checking for errors on load.");
}, 1000);
