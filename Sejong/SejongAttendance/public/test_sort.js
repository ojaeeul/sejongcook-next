
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
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:8000/sheet.html', { waitUntil: 'networkidle2', timeout: 5000 });
    await page.screenshot({ path: '/Users/ojaeeul/.gemini/antigravity/brain/6e6f9e87-5057-41b7-9fb5-fb13935ae977/sorted_sheet.png' });
    console.log('SORT_SUCCESS');
  } catch(e) {
    console.log('ERR:', e.message);
  }
  
  await browser.close();
})();
