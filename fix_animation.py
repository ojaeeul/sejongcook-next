import re

with open("Sejong/SejongAttendance/public/expense_logic.js", "r", encoding="utf-8") as f:
    js = f.read()

# Replace the changeExpensePage function
new_change_expense_page = """window.changeExpensePage = function(dir) {
    const notebook = document.querySelector('.notebook');
    if (!notebook) return;
    
    // Prevent multiple clicks
    if (document.querySelector('.flip-page-container')) return;
    
    const pageRight = document.querySelector('.page-right');
    const pageLeft = document.querySelector('.page-left');
    
    const oldPageHTMLRight = pageRight.innerHTML;
    const oldPageHTMLLeft = pageLeft.innerHTML;

    currentExpensePage += dir;
    updateExpensePagination();
    
    const newPageHTMLRight = pageRight.innerHTML;
    const newPageHTMLLeft = pageLeft.innerHTML;
    
    // 3D Flip 애니메이션
    const flipContainer = document.createElement('div');
    flipContainer.className = 'flip-page-container';
    
    const front = document.createElement('div');
    front.className = 'flip-page-front page page-right';
    
    const back = document.createElement('div');
    back.className = 'flip-page-back page page-left';
    
    // 임시로 가려줄 밑바닥 페이지 (애니메이션 도중 이상하게 변하는 걸 막기 위함)
    const staticUnderlay = document.createElement('div');
    staticUnderlay.style.position = 'absolute';
    staticUnderlay.style.top = '0';
    staticUnderlay.style.width = '50%';
    staticUnderlay.style.height = '100%';
    staticUnderlay.style.zIndex = '90';
    staticUnderlay.style.pointerEvents = 'none';
    staticUnderlay.className = 'page';
    
    if (dir > 0) {
        // 다음 페이지로: 오른쪽 페이지가 왼쪽으로 넘어감
        front.innerHTML = oldPageHTMLRight;
        back.innerHTML = newPageHTMLLeft;
        
        staticUnderlay.style.left = '0';
        staticUnderlay.classList.add('page-left');
        staticUnderlay.innerHTML = oldPageHTMLLeft; // 왼쪽은 아직 예전 페이지가 보여야 함
    } else {
        // 이전 페이지로: 왼쪽 페이지가 오른쪽으로 넘어감
        front.innerHTML = oldPageHTMLLeft;
        back.innerHTML = newPageHTMLRight;
        
        staticUnderlay.style.right = '0';
        staticUnderlay.classList.add('page-right');
        staticUnderlay.innerHTML = oldPageHTMLRight; // 오른쪽은 아직 예전 페이지가 보여야 함
        
        // 플립 시작점
        flipContainer.style.transform = 'rotateY(180deg)';
        flipContainer.style.left = '0';
        flipContainer.style.right = 'auto';
        front.classList.remove('page-right');
        front.classList.add('page-left');
        back.classList.remove('page-left');
        back.classList.add('page-right');
    }
    
    flipContainer.appendChild(front);
    flipContainer.appendChild(back);
    
    notebook.appendChild(staticUnderlay);
    notebook.appendChild(flipContainer);
    
    // Reflow
    void flipContainer.offsetWidth;
    
    if (dir > 0) {
        flipContainer.style.transform = 'rotateY(-180deg)';
    } else {
        flipContainer.style.transform = 'rotateY(0deg)';
    }
    
    setTimeout(() => {
        if (flipContainer.parentNode) flipContainer.parentNode.removeChild(flipContainer);
        if (staticUnderlay.parentNode) staticUnderlay.parentNode.removeChild(staticUnderlay);
    }, 600);
};"""

# Use regex to replace the old changeExpensePage function
js = re.sub(r'window\.changeExpensePage\s*=\s*function\(dir\)\s*\{.*?\};\n', new_change_expense_page + '\n', js, flags=re.DOTALL)

with open("Sejong/SejongAttendance/public/expense_logic.js", "w", encoding="utf-8") as f:
    f.write(js)
