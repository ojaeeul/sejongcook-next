const { JSDOM } = require('jsdom');
const fs = require('fs');
const html = fs.readFileSync('Sejong/SejongAttendance/public/sheet.html', 'utf-8');

const dom = new JSDOM(html, { url: "http://localhost/", runScripts: "dangerously" });
dom.window.localStorage.setItem('sejong_ledger_sync', '{}');

// Read actual local JSON files if they exist, or fallback
const readLocalJSON = (file) => {
    try {
        const path = `Sejong/SejongAttendance/app/data/${file}`;
        if (fs.existsSync(path)) return JSON.parse(fs.readFileSync(path, 'utf8'));
        return [];
    } catch(e) { return []; }
};

dom.window.fetch = async (url) => {
    let data = [];
    if (url.includes('attendance')) data = readLocalJSON('attendance.json');
    if (url.includes('members')) data = readLocalJSON('members.json');
    if (url.includes('timetable')) data = readLocalJSON('timetable.json');
    if (url.includes('holidays')) data = readLocalJSON('holidays.json');
    if (url.includes('settings')) data = readLocalJSON('settings.json');
    return { ok: true, json: async () => data };
};

dom.window.addEventListener('error', (event) => {
    console.error("Caught runtime error:", event.error);
    process.exit(1);
});
setTimeout(() => {
    console.log("Done checking for errors. Sheet rendered without throwing.");
    // Check if table rows are populated
    const tbody = dom.window.document.getElementById('attendanceTbody');
    console.log("Table rows:", tbody ? tbody.children.length : "NO TBODY");
}, 1500);
