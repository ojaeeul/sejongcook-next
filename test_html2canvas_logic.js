function captureExcelToImage(htmlStr) {
    // Conceptual code
    const div = document.createElement('div');
    div.innerHTML = htmlStr;
    // apply basic styles
    div.style.cssText = "position:absolute; top:-9999px; left:-9999px; background:white; padding:20px; font-family:sans-serif; width:800px; color:black;";
    document.body.appendChild(div);
    
    // Make tables look like excel
    const tables = div.querySelectorAll('table');
    tables.forEach(t => {
        t.style.borderCollapse = 'collapse';
        t.style.width = '100%';
        t.querySelectorAll('td, th').forEach(cell => {
            cell.style.border = '1px solid #ccc';
            cell.style.padding = '4px 8px';
        });
    });

    html2canvas(div).then(canvas => {
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        document.body.removeChild(div);
        return base64;
    });
}
