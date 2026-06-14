import re

def update_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find the end of notebook:
    #                         <div id="indexTabs" class="notebook-tabs">
    #                             <!-- JS Injected Tabs -->
    #                         </div>
    #                     </div>
    
    insertion = """
                        <!-- Pagination Controls -->
                        <div class="pagination-controls" style="display: none;">
                            <button id="phonebook-prev-btn" class="page-btn" onclick="changePage(-1)" disabled>
                                <i class="material-icons">chevron_left</i> 이전
                            </button>
                            <span id="phonebook-page-indicator" class="page-indicator"><span>1</span><span>/</span><span>1</span></span>
                            <button id="phonebook-next-btn" class="page-btn" onclick="changePage(1)">
                                다음 <i class="material-icons">chevron_right</i>
                            </button>
                        </div>
                    </div>"""
                    
    html = html.replace('                        </div>\n                    </div>', '                        </div>' + insertion)

    # Add the CSS for pagination-controls
    # Wait, phonebook.html already has some CSS for it? No, we found it missing. Let's add it.
    css = """        /* Pagination Controls */
        .pagination-controls {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            z-index: 50;
        }
        .page-indicator {
            display: flex;
            flex-direction: column;
            align-items: center;
            font-size: 16px;
            font-weight: 800;
            color: #1e293b;
            line-height: 1.1;
        }
        .page-btn {
            padding: 6px 12px;
            font-size: 14px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s;
        }
        .page-btn:hover:not(:disabled) {
            background: #2563eb;
        }
        .page-btn:disabled {
            background: #cbd5e1;
            cursor: not-allowed;
        }"""
        
    html = html.replace('        /* 모달 스타일 */', css + '\n\n        /* 모달 스타일 */')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

update_html('Sejong/SejongAttendance/public/phonebook.html')
print("Phonebook HTML fixed")
