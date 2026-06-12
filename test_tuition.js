// eslint-disable-next-line @typescript-eslint/no-require-imports
const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser to inspect http://localhost:8000/tuition.html...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[Browser Console ${msg.type()}]:`, msg.text());
  });
  
  page.on('pageerror', err => {
    console.error('[Browser Page Error]:', err.toString());
  });
  
  page.on('response', response => {
    const status = response.status();
    if (status >= 400) {
      console.log(`[HTTP ERROR ${status}]: ${response.url()}`);
    }
  });
  
  try {
    const response = await page.goto('http://localhost:8000/tuition.html', { 
      waitUntil: 'networkidle2', 
      timeout: 10000 
    });
    console.log(`Navigation complete. Status: ${response.status()}`);
    
    // Evaluate DOM elements across different states/tabs
    const results = await page.evaluate(async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const getTabResults = () => {
        const tbody = document.getElementById('tuitionListBody');
        const rows = tbody ? tbody.querySelectorAll('tr') : [];
        const rowCount = rows.length;
        
        const rowDetails = [];
        for (let i = 0; i < Math.min(rowCount, 10); i++) {
          rowDetails.push(rows[i].innerText || rows[i].innerHTML);
        }
        return { rowCount, rowDetails };
      };
      
      const tabData = {};
      
      const getOverdueRows = () => {
        const rows = document.querySelectorAll('tr');
        const overdueRows = [];
        rows.forEach(r => {
          if (r.innerText.includes('(미납)') || r.innerHTML.includes('#e11d48')) {
            overdueRows.push(r.innerText.replace(/\n/g, ' '));
          }
        });
        return overdueRows;
      };
      
      // 1. Check currently active tab (usually 'enrolled')
      tabData.enrolled_overdue = getOverdueRows();
      
      // 2. Click 'unpaid' tab
      const unpaidTab = document.querySelector('.status-tab.tab-unpaid');
      if (unpaidTab) {
        unpaidTab.click();
        tabData.unpaid_overdue = getOverdueRows();
      }
      
      return {
        tabData,
        selectedYear: document.getElementById('yearSelect')?.value,
        selectedMonth: document.getElementById('monthSelect')?.value
      };
    });
    
    console.log('--- DOM INSPECTION RESULTS ---');
    console.log('Selected Year/Month:', results.selectedYear, '/', results.selectedMonth);
    console.log('Enrolled overdue:', results.tabData.enrolled_overdue);
    console.log('Unpaid overdue:', results.tabData.unpaid_overdue);
    console.log('------------------------------');
  } catch (e) {
    console.error('Page navigation failed:', e.message);
  }
  
  await browser.close();
})();
