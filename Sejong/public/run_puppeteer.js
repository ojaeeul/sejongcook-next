
function getFetchUrl(endpoint, isPost = false) {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let url = '';
    if (isLocal) {
        if (endpoint === 'settings') {
            url = 'http://localhost:8000/api/admin/data/settings';
        } else {
            url = `http://localhost:8000/api/${endpoint}`;
        }
        return isPost ? url : url + (url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
    } else {
        const base = `../api.php?board=sejong_${endpoint}`;
        return isPost ? base : base + `&t=${Date.now()}`;
    }
}

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new"
  });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[DEBUG]')) {
        console.log(text);
    }
  });

  await page.goto('http://localhost:8000/sheet.html', { waitUntil: 'networkidle0' });
  
  await browser.close();
})();
