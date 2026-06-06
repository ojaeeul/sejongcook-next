
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
  let hasError = false;
  
  page.on('console', msg => { 
    if (msg.type() === 'error') { 
      console.log('BROWSER_ERR:', msg.text()); 
      hasError = true; 
    } 
  });
  
  page.on('pageerror', err => { 
    console.log('PAGE_ERR:', err.toString()); 
    hasError = true; 
  });
  
  try {
    const response = await page.goto('http://localhost:8000/sheet.html', { waitUntil: 'networkidle2', timeout: 5000 });
    console.log('HTTP_STATUS:', response.status());
    if (!hasError) console.log('TABLE_RENDERED_SUCCESSFULLY');
  } catch(e) {
    console.log('CONNECTION_ERR:', e.message);
  }
  
  await browser.close();
})();
