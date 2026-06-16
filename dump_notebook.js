async function dump() {
    const res = await fetch('http://localhost:3000/api/sejong/expense?year=all&t=' + Date.now());
    const dataArray = await res.json();
    const notebooks = Array.isArray(dataArray) ? dataArray : [dataArray];
    
    notebooks.forEach(data => {
        if (!data) return;
        let notebookYear = data.expenseYear || '2026';
        let leftHTML = data.leftHTML || '';
        
        console.log("===================================");
        console.log("Notebook Year:", notebookYear);
        const rowRegex = /<div class="entry-line[^>]*>([\s\S]*?)<\/div>(?=\s*<div class="entry-line|$)/g;
        let m;
        let rowCount = 0;
        while ((m = rowRegex.exec(leftHTML)) !== null) {
            const inner = m[1];
            const dateMatch = inner.match(/<div class="date-col[^>]*>([\s\S]*?)<\/div>/);
            const descMatch = inner.match(/<div class="desc-col[^>]*>([\s\S]*?)<\/div>/);
            const amtMatch = inner.match(/<div class="amount-col[^>]*>([\s\S]*?)<\/div>/);
            
            let dText = dateMatch ? dateMatch[1].replace(/&nbsp;/g, ' ').trim() : '';
            let amountText = amtMatch ? amtMatch[1].replace(/&nbsp;/g, ' ').trim() : '';
            let descText = descMatch ? descMatch[1].replace(/&nbsp;/g, ' ').trim() : '';
            
            if (dText || descText || amountText) {
                console.log(`[${notebookYear}] Row ${rowCount}: Date="${dText}", Desc="${descText}", Amt="${amountText}"`);
                rowCount++;
            }
        }
    });
}
dump();
