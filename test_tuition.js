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
      
      // 1. Check currently active tab (usually 'enrolled')
      tabData.enrolled = getTabResults();
      
      // 2. Click 'unpaid' tab
      const unpaidTab = document.querySelector('.status-tab.tab-unpaid');
      if (unpaidTab) {
        unpaidTab.click();
        // Allow DOM to update synchronously (since renderTable is sync)
        tabData.unpaid = getTabResults();
      }
      
      // 3. Click 'paid' tab
      const paidTab = document.querySelector('.status-tab.tab-paid');
      if (paidTab) {
        paidTab.click();
        tabData.paid = getTabResults();
      }
      
      return {
        tabData,
        selectedYear: document.getElementById('yearSelect')?.value,
        selectedMonth: document.getElementById('monthSelect')?.value
      };
    });
    
    console.log('--- DOM INSPECTION RESULTS ---');
    console.log('Selected Year/Month:', results.selectedYear, '/', results.selectedMonth);
    console.log('Enrolled tab rows:', results.tabData.enrolled.rowCount);
    console.log('Unpaid tab rows:', results.tabData.unpaid ? results.tabData.unpaid.rowCount : 'N/A');
    console.log('Unpaid tab row details:', results.tabData.unpaid ? results.tabData.unpaid.rowDetails : []);
    console.log('Paid tab rows:', results.tabData.paid ? results.tabData.paid.rowCount : 'N/A');
    console.log('Paid tab row details:', results.tabData.paid ? results.tabData.paid.rowDetails : []);
    console.log('------------------------------');
  } catch (e) {
    console.error('Page navigation failed:', e.message);
  }
  
  await browser.close();
})();
