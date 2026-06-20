const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const html = fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/stats.html', 'utf8');
const js = fs.readFileSync('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/stats.js', 'utf8');

const dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost/stats.html" });

// Mock fetch
dom.window.fetch = async (url) => {
    if (url.includes('members')) {
        return { ok: true, json: async () => JSON.parse(fs.readFileSync('./public/data/members.json', 'utf8')) };
    }
    if (url.includes('payments')) {
        return { ok: true, json: async () => JSON.parse(fs.readFileSync('./public/data/payments.json', 'utf8')) };
    }
    if (url.includes('attendance')) {
        return { ok: true, json: async () => JSON.parse(fs.readFileSync('./public/data/attendance.json', 'utf8')) };
    }
    if (url.includes('expense')) {
        return { ok: true, json: async () => [] };
    }
    if (url.includes('settings')) {
        return { ok: true, json: async () => ({}) };
    }
    return { ok: false };
};

// Mock calculateRedBoxesForMonth
dom.window.calculateRedBoxesForMonth = () => ({});

// Run script
dom.window.eval(js);

setTimeout(() => {
    console.log("dashStudents text:", dom.window.document.getElementById('dashStudents').innerText);
    console.log("dashPayment text:", dom.window.document.getElementById('dashPayment').innerText);
    
    // Check if error
    if (dom.window.document.getElementById('aiReportBox') && dom.window.document.getElementById('aiReportBox').innerHTML.includes('실패')) {
        console.log("AI Report Box Error:", dom.window.document.getElementById('aiReportBox').innerHTML);
    }
}, 1000);
