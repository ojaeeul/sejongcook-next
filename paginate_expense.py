import re

with open("Sejong/SejongAttendance/public/expense.html", "r", encoding="utf-8") as f:
    html = f.read()

# Add CSS for pagination and flip
css_to_add = """
        /* Pagination Controls */
        .pagination-controls {
            margin-top: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            padding-bottom: 30px;
        }
        .page-btn {
            padding: 8px 16px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            display: flex;
            align-items: center;
        }
        .page-btn:disabled {
            background: #cbd5e1;
            cursor: not-allowed;
        }
        .hidden-page-line {
            display: none !important;
        }

        /* 3D Flip Animation */
        .notebook {
            perspective: 2000px;
        }
        .flip-page-container {
            position: absolute;
            top: 0;
            right: 0;
            width: 50%;
            height: 100%;
            transform-style: preserve-3d;
            transform-origin: left center;
            z-index: 100;
            pointer-events: none;
            transition: transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1);
        }
        .flip-page-front, .flip-page-back {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            backface-visibility: hidden;
            background: #fcf9f2;
            background-image: repeating-linear-gradient(transparent, transparent 23px, #cbd5e1 23px, #cbd5e1 24px);
            background-position: 0 40px;
            background-size: 100% 768px;
            background-repeat: no-repeat;
            border-radius: 12px;
            box-shadow: inset 0 0 15px rgba(0,0,0,0.05);
            overflow: hidden;
            padding: 40px 15px 40px 5px;
            font-family: 'Nanum Pen Script', cursive;
            font-size: 19px;
            color: #334155;
        }
        .flip-page-back {
            transform: rotateY(180deg);
        }
        .flip-page-container.flip {
            transform: rotateY(-180deg);
        }
"""
html = html.replace('</style>', css_to_add + '\n    </style>')

# Add pagination HTML
html = html.replace('</main>', '''
            <!-- Pagination Controls -->
            <div class="pagination-controls">
                <button id="expense-prev-btn" class="page-btn" onclick="changeExpensePage(-1)" disabled>
                    <i class="material-icons">chevron_left</i> 이전
                </button>
                <span id="expense-page-indicator" style="font-weight: bold; color: #475569;">1 / 1</span>
                <button id="expense-next-btn" class="page-btn" onclick="changeExpensePage(1)">
                    다음 <i class="material-icons">chevron_right</i>
                </button>
            </div>
        </main>
''')

with open("Sejong/SejongAttendance/public/expense.html", "w", encoding="utf-8") as f:
    f.write(html)
print("expense.html modified.")

with open("Sejong/SejongAttendance/public/expense_logic.js", "r", encoding="utf-8") as f:
    js = f.read()

# Modify document.addEventListener('DOMContentLoaded', ...)
js = js.replace('''    // 초기 로딩 및 결제 연동 후 최종적으로 중복 날짜 숨김 처리 적용
    hideDuplicateDates();
});''', '''    // 초기 로딩 및 결제 연동 후 최종적으로 중복 날짜 숨김 처리 적용
    hideDuplicateDates();
    updateExpensePagination();
});''')

# Modify loadNotebookData()
js = js.replace('''    fixMissingCols();
    hideDuplicateDates();''', '''    fixMissingCols();
    hideDuplicateDates();
    updateExpensePagination();''')

# Add pagination logic at the end
pagination_js = """
// --- Pagination Logic ---
let currentExpensePage = 0;
const LINES_PER_PAGE = 32;

function updateExpensePagination() {
    const expContainer = document.getElementById('expense-container');
    const cookContainer = document.getElementById('sales-cooking-container');
    const bakeContainer = document.getElementById('sales-baking-container');
    
    if (!expContainer || !cookContainer || !bakeContainer) return;

    const expLines = Array.from(expContainer.children).filter(c => c.classList.contains('entry-line'));
    const cookLines = Array.from(cookContainer.children).filter(c => c.classList.contains('entry-line'));
    const bakeLines = Array.from(bakeContainer.children).filter(c => c.classList.contains('entry-line'));
    
    const maxLines = Math.max(expLines.length, cookLines.length, bakeLines.length);
    const totalPages = Math.max(1, Math.ceil(maxLines / LINES_PER_PAGE));
    
    if (currentExpensePage >= totalPages) {
        currentExpensePage = totalPages - 1;
    }
    
    const applyVisibility = (lines) => {
        lines.forEach((line, index) => {
            if (index >= currentExpensePage * LINES_PER_PAGE && index < (currentExpensePage + 1) * LINES_PER_PAGE) {
                line.classList.remove('hidden-page-line');
            } else {
                line.classList.add('hidden-page-line');
            }
        });
    };
    
    applyVisibility(expLines);
    applyVisibility(cookLines);
    applyVisibility(bakeLines);
    
    const ind = document.getElementById('expense-page-indicator');
    if (ind) ind.textContent = `${currentExpensePage + 1} / ${totalPages}`;
    
    const prev = document.getElementById('expense-prev-btn');
    if (prev) prev.disabled = currentExpensePage === 0;
    
    const next = document.getElementById('expense-next-btn');
    if (next) next.disabled = currentExpensePage === totalPages - 1;
}

window.changeExpensePage = function(dir) {
    const notebook = document.querySelector('.notebook');
    if (!notebook) return;
    
    const oldPageHTMLRight = document.querySelector('.page-right').innerHTML;
    const oldPageHTMLLeft = document.querySelector('.page-left').innerHTML;

    currentExpensePage += dir;
    
    // UI 업데이트 (페이지 내용 변경)
    updateExpensePagination();
    
    // 3D Flip 애니메이션
    const flipContainer = document.createElement('div');
    flipContainer.className = 'flip-page-container';
    
    const front = document.createElement('div');
    front.className = 'flip-page-front page page-right';
    // 오른쪽에서 왼쪽으로 넘길 때는 현재 페이지의 뒷면(오른쪽)이 앞으로 넘어가야 함
    front.innerHTML = dir > 0 ? oldPageHTMLRight : document.querySelector('.page-right').innerHTML;
    
    const back = document.createElement('div');
    back.className = 'flip-page-back page page-left';
    // 넘어간 페이지의 뒷면은 다음 페이지의 왼쪽면
    back.innerHTML = dir > 0 ? document.querySelector('.page-left').innerHTML : oldPageHTMLLeft;
    
    flipContainer.appendChild(front);
    flipContainer.appendChild(back);
    
    if (dir < 0) {
        // 왼쪽에서 오른쪽으로 넘길 때 (이전 페이지)
        flipContainer.style.transform = 'rotateY(-180deg)';
    }
    
    notebook.appendChild(flipContainer);
    
    // Reflow
    void flipContainer.offsetWidth;
    
    if (dir > 0) {
        flipContainer.classList.add('flip');
    } else {
        flipContainer.style.transform = 'rotateY(0)';
    }
    
    setTimeout(() => {
        if (flipContainer.parentNode) {
            flipContainer.parentNode.removeChild(flipContainer);
        }
    }, 600);
};

// ensureMinimumLines 수정 (항상 LINES_PER_PAGE 배수로 채우기)
const originalEnsureMinimumLines = ensureMinimumLines;
window.ensureMinimumLines = function() {
    originalEnsureMinimumLines();
    const expContainer = document.getElementById('expense-container');
    const cookContainer = document.getElementById('sales-cooking-container');
    const bakeContainer = document.getElementById('sales-baking-container');
    
    if (!expContainer || !cookContainer || !bakeContainer) return;
    
    let maxLen = Math.max(
        expContainer.children.length, 
        cookContainer.children.length, 
        bakeContainer.children.length
    );
    
    let targetLines = Math.ceil(maxLen / LINES_PER_PAGE) * LINES_PER_PAGE;
    if (targetLines === 0) targetLines = LINES_PER_PAGE;
    
    const padContainer = (container) => {
        while (container.children.length < targetLines) {
            const line = document.createElement('div');
            line.className = 'entry-line';
            if (container.id === 'sales-baking-container') {
                line.innerHTML = `<div class="desc-col" contenteditable="true" spellcheck="false"></div><div class="amount-col" contenteditable="true" spellcheck="false"></div><div class="method-col" contenteditable="true" spellcheck="false"></div>`;
            } else {
                line.innerHTML = `<div class="date-col" contenteditable="true" spellcheck="false"></div><div class="desc-col" contenteditable="true" spellcheck="false"></div><div class="amount-col" contenteditable="true" spellcheck="false"></div><div class="method-col" contenteditable="true" spellcheck="false"></div>`;
            }
            container.appendChild(line);
        }
    };
    
    padContainer(expContainer);
    padContainer(cookContainer);
    padContainer(bakeContainer);
    updateExpensePagination();
};
"""
if "updateExpensePagination()" not in js:
    js += "\n" + pagination_js

with open("Sejong/SejongAttendance/public/expense_logic.js", "w", encoding="utf-8") as f:
    f.write(js)
print("expense_logic.js modified.")
