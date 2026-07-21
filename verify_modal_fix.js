const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "Sejong/SejongAttendance/public/sheet.html");
const html = fs.readFileSync(htmlPath, "utf-8");

const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Simulate the old way
const oldModals = document.querySelectorAll('.modal-overlay:not(.hidden)');
console.log("[Old Way] modals.length > 0 ?", oldModals.length > 0, `(Found: ${oldModals.length})`);

// Simulate the new way
// Note: jsdom getComputedStyle support is basic, but we can verify if inline style display is none
const newModals = Array.from(document.querySelectorAll('.modal-overlay')).filter(m => window.getComputedStyle(m).display !== 'none');
console.log("[New Way] modals.length > 0 ?", newModals.length > 0, `(Found: ${newModals.length})`);

console.log("If Old is true and New is false, the fix works perfectly!");
