const fs = require('fs');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const code = fs.readFileSync('public/sejong/sms_v3.js', 'utf8');

const dom = new JSDOM(`<!DOCTYPE html><html><body><div id="calendarDays"></div><div id="calendarTitle"></div><input id="paymentRangeStart" /><input id="paymentRangeEnd" /></body></html>`);
const window = dom.window;
const document = window.document;

try {
    window.eval(code);
    console.log("No top-level error");
} catch(e) {
    console.log("TOP LEVEL ERROR:", e.message);
    console.log(e.stack);
}
