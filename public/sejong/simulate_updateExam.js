const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam.html', 'utf8');
const script = fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/exam.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously" });
const window = dom.window;
const document = window.document;

// Mock fetch
window.fetch = async (url) => {
    if (url === 'test_members.json') {
        return { ok: true, json: async () => JSON.parse(fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/test_members.json', 'utf8')) };
    }
    if (url === 'exam_data.json') {
        return { ok: true, json: async () => [] };
    }
    return { ok: true, json: async () => [] };
};

window.getHangulInitial = function(char) { return "g"; } // mock
window.generateId = function(name, resident_num) { return "g@"; } // mock

// inject script
const scriptEl = document.createElement("script");
scriptEl.textContent = script;
document.body.appendChild(scriptEl);

setTimeout(() => {
    // Simulate updateExam
    window.updateExam(0, 'name', '길삼이');
    
    // Check if modal is active
    const modal = document.getElementById('courseSelectModal');
    console.log("Modal active?", modal.classList.contains('active'));
    console.log("Modal HTML:", document.getElementById('courseSelectList').innerHTML);
}, 1000);
