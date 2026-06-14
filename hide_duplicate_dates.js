function hideDuplicateDates() {
    const containers = [
        document.getElementById('expense-container'),
        document.getElementById('sales-cooking-container')
    ];
    
    containers.forEach(container => {
        if (!container) return;
        let lastDate = null;
        
        const rows = container.querySelectorAll('.entry-line');
        rows.forEach(row => {
            const dateCol = row.querySelector('.date-col');
            if (!dateCol) return;
            
            const currentDate = dateCol.textContent.trim();
            
            // Remove the class first
            dateCol.classList.remove('duplicate-date');
            
            if (currentDate !== '') {
                if (currentDate === lastDate) {
                    dateCol.classList.add('duplicate-date');
                } else {
                    lastDate = currentDate;
                }
            } else {
                // If the current cell is empty, it shouldn't affect the last known date.
                // Or should it reset? Usually in ledgers, blank date just means "same as above".
                // But wait, if they leave it blank intentionally, they want it blank.
            }
        });
    });
}
