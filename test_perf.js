const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser to inspect http://localhost:8000/index.html...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const requests = {};
  
  // Track requests
  page.on('request', req => {
    requests[req.url()] = {
      url: req.url(),
      method: req.method(),
      start: Date.now(),
    };
  });
  
  page.on('requestfinished', req => {
    const url = req.url();
    if (requests[url]) {
      requests[url].end = Date.now();
      requests[url].duration = requests[url].end - requests[url].start;
      requests[url].status = req.response() ? req.response().status() : 'N/A';
    }
  });

  page.on('requestfailed', req => {
    const url = req.url();
    if (requests[url]) {
      requests[url].end = Date.now();
      requests[url].duration = requests[url].end - requests[url].start;
      requests[url].failed = true;
      requests[url].errorText = req.failure()?.errorText || 'Unknown error';
      requests[url].status = req.response() ? req.response().status() : 'FAILED';
    }
  });

  page.on('console', msg => {
    console.log(`[Browser Console ${msg.type()}]:`, msg.text());
  });

  page.on('pageerror', err => {
    console.error('[Browser Page Error]:', err.toString());
  });

  const pageStart = Date.now();
  try {
    const response = await page.goto('http://localhost:8000/index.html', { 
      waitUntil: 'networkidle2', 
      timeout: 10000 
    });
    const totalTime = Date.now() - pageStart;
    console.log(`\nNavigation complete in ${totalTime}ms. Status: ${response.status()}`);
    
    console.log('\n--- Request Summary ---');
    for (const url in requests) {
      const r = requests[url];
      const durationStr = r.duration !== undefined ? `${r.duration}ms` : 'pending';
      const statusStr = r.failed ? `FAILED (${r.errorText})` : `HTTP ${r.status || 'N/A'}`;
      console.log(`- ${r.method} ${url} -> ${statusStr} [${durationStr}]`);
    }
    
  } catch (e) {
    console.error('Page navigation failed:', e.message);
  }

  await browser.close();
})();
