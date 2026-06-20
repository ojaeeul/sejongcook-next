document.addEventListener('DOMContentLoaded', () => {
    const monthSelect = document.getElementById('monthSelect');
    if (!monthSelect) return;
    if (monthSelect.dataset.arrowsAdded) return;

    setTimeout(() => {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'inline-flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.border = '1px solid #cbd5e1';
        wrapper.style.borderRadius = '6px';
        wrapper.style.background = '#fff';
        wrapper.style.height = '36px'; 
        
        monthSelect.parentNode.insertBefore(wrapper, monthSelect);
        
        monthSelect.style.border = 'none';
        monthSelect.style.outline = 'none';
        monthSelect.style.boxShadow = 'none';
        monthSelect.style.height = '100%';
        monthSelect.style.background = 'transparent';
        monthSelect.style.paddingLeft = '6px';
        monthSelect.style.paddingRight = '12px';
        monthSelect.style.margin = '0';
        monthSelect.style.width = '75px'; // 넓이를 넉넉하게 고정
        monthSelect.style.minWidth = '75px';
        monthSelect.style.textAlign = 'center';
        
        const leftBtn = document.createElement('button');
        leftBtn.innerHTML = '<span class="material-icons" style="font-size: 1.1rem; line-height:1;">chevron_left</span>';
        leftBtn.style.display = 'flex';
        leftBtn.style.alignItems = 'center';
        leftBtn.style.justifyContent = 'center';
        leftBtn.style.height = '100%';
        leftBtn.style.padding = '0 6px';
        leftBtn.style.background = '#f8fafc';
        leftBtn.style.border = 'none';
        leftBtn.style.borderRight = '1px solid #e2e8f0';
        leftBtn.style.cursor = 'pointer';
        leftBtn.style.color = '#475569';
        
        const rightBtn = leftBtn.cloneNode(true);
        rightBtn.innerHTML = '<span class="material-icons" style="font-size: 1.1rem; line-height:1;">chevron_right</span>';
        rightBtn.style.borderRight = 'none';
        rightBtn.style.borderLeft = '1px solid #e2e8f0';
        
        const changeMonth = (delta) => {
            let m = parseInt(monthSelect.value);
            if (isNaN(m)) return;
            m += delta;
            
            let ySelect = document.getElementById('yearSelect');
            let y = ySelect ? parseInt(ySelect.value) : new Date().getFullYear();
            
            if (m < 1) {
                m = 12;
                y -= 1;
                if (ySelect) {
                    ySelect.value = y;
                    ySelect.dispatchEvent(new Event('change'));
                }
            } else if (m > 12) {
                m = 1;
                y += 1;
                if (ySelect) {
                    ySelect.value = y;
                    ySelect.dispatchEvent(new Event('change'));
                }
            }
            
            monthSelect.value = m;
            monthSelect.dispatchEvent(new Event('change'));
        };
        
        leftBtn.onclick = (e) => { e.preventDefault(); changeMonth(-1); };
        rightBtn.onclick = (e) => { e.preventDefault(); changeMonth(1); };
        
        wrapper.appendChild(leftBtn);
        wrapper.appendChild(monthSelect);
        wrapper.appendChild(rightBtn);
        
        monthSelect.dataset.arrowsAdded = 'true';
    }, 100);
});
