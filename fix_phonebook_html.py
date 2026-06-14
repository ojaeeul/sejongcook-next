import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/phonebook.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update main-wrapper to allow horizontal scroll
html = html.replace('<main class="main-wrapper">', '<main class="main-wrapper" style="overflow-x: auto;">')

# 2. Update the notebook structure inside content-scroll
old_structure = """                <div class="notebook-wrapper">
                    <div id="phonebookContainer" class="notebook-container">
                        <div class="loading" style="text-align:center; padding:50px; color:#64748b; width: 100%;">수강생 정보를 불러오는 중입니다...</div>
                    </div>
                    <div id="indexTabs" class="notebook-tabs">
                        <!-- JS Injected Tabs -->
                    </div>
                </div>"""

new_structure = """                <div class="notebook-wrapper">
                    <div class="notebook" id="phonebookNotebook">
                        <div class="page page-left" id="phonebookPageLeft">
                            <div class="loading" style="text-align:center; padding:50px; color:#64748b; width: 100%;">수강생 정보를 불러오는 중입니다...</div>
                        </div>
                        <div class="binding"></div>
                        <div class="page page-right" id="phonebookPageRight">
                        </div>
                        <div id="indexTabs" class="notebook-tabs">
                            <!-- JS Injected Tabs -->
                        </div>
                    </div>
                </div>"""

html = html.replace(old_structure, new_structure)

# 3. Replace CSS from .notebook-wrapper { up to .phone-card-list {
css_start = html.find('.notebook-wrapper {')
css_end = html.find('.phone-card-list {')

new_css = """        .notebook-wrapper {
            display: flex;
            align-items: flex-start;
            padding: 40px 10px;
            min-height: calc(100vh - 80px);
            background-color: #d1d5db;
        }

        .notebook {
            display: flex;
            width: 100%;
            max-width: none;
            min-width: 1200px;
            height: 850px;
            margin: auto;
            background: #fcf9f2;
            border-radius: 12px;
            box-shadow: 20px 20px 40px rgba(0,0,0,0.2), -5px 5px 15px rgba(0,0,0,0.05);
            position: relative;
        }

        .page {
            flex: 1;
            position: relative;
            background-image: repeating-linear-gradient(transparent, transparent 23px, #cbd5e1 23px, #cbd5e1 24px);
            background-position: 0 40px;
            background-size: 100% 768px; /* 24px * 32칸 = 768px */
            background-repeat: no-repeat;
            padding: 40px 15px 40px 10px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        .page-left {
            border-top-left-radius: 12px;
            border-bottom-left-radius: 12px;
        }

        .page-right {
            border-top-right-radius: 12px;
            border-bottom-right-radius: 12px;
        }

        /* 세로 빨간색 마진 선 */
        .page::before {
            content: '';
            position: absolute;
            top: 40px;
            height: 768px;
            left: 30px;
            width: 2px;
            background-color: #fca5a5;
            z-index: 1;
        }

        /* 중앙 스프링 바인딩 */
        .binding {
            width: 40px;
            background: linear-gradient(to right, #e2e8f0 0%, #fcf9f2 20%, #e2e8f0 50%, #fcf9f2 80%, #e2e8f0 100%);
            position: relative;
            z-index: 10;
            box-shadow: inset 0 0 15px rgba(0,0,0,0.1);
        }
        .binding::before {
            content: '';
            position: absolute;
            top: 40px;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            width: 30px;
            background-image: repeating-linear-gradient(
                transparent, 
                transparent 16px, 
                #475569 16px, 
                #94a3b8 18px, 
                #334155 20px, 
                #1e293b 24px, 
                transparent 24px, 
                transparent 40px
            );
        }

        .notebook-tabs {
            position: absolute;
            right: -35px;
            top: 40px;
            display: flex;
            flex-direction: column;
            gap: 2px;
            z-index: 9;
        }

        .index-tab {
            background-color: var(--tab-bg, #f8fafc);
            background-image: linear-gradient(150deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.2) 35%, transparent 50%, rgba(0,0,0,0.05) 100%);
            color: var(--tab-text, #64748b);
            border: 1px solid rgba(0,0,0,0.15);
            border-left: none;
            padding: 8px 12px;
            border-radius: 0 8px 8px 0;
            cursor: pointer;
            font-weight: 800;
            box-shadow: inset 1px 1px 2px rgba(255,255,255,0.8), 2px 2px 4px rgba(0,0,0,0.08);
            transition: all 0.2s ease;
            font-size: 0.9rem;
            text-align: center;
            min-width: 35px;
            opacity: 0.7;
            text-shadow: 0 1px 1px rgba(0,0,0,0.1);
        }

        .index-tab:hover {
            opacity: 0.95;
            transform: translateX(4px);
        }

        .index-tab.active {
            opacity: 1;
            transform: translateX(8px);
            z-index: 11;
            position: relative;
            box-shadow: inset 1px 1px 3px rgba(255,255,255,0.8), 4px 2px 8px rgba(0, 0, 0, 0.25);
        }

        .page-header {
            position: absolute;
            top: 10px;
            left: 40px;
            z-index: 2;
        }

        .page-title {
            font-family: 'Noto Sans KR', sans-serif;
            font-size: 22px;
            font-weight: 900;
            color: #1e293b;
            margin: 0;
        }

        """
html = html[:css_start] + new_css + html[css_end:]

# 4. Modify phone-card to fit exactly 24px line height.
html = html.replace('.phone-card {', '.phone-card {\n            position: relative;\n            z-index: 2;\n            padding-left: 25px; /* Red line offset */\n')
html = html.replace('height: 40px; /* match line height of notebook paper */', 'height: 24px; line-height: 24px; font-family: "Nanum Pen Script", cursive;')

# Make fonts look like handwritten or fit 24px.
html = html.replace('font-size: 1rem;', 'font-size: 19px;')
html = html.replace('font-size: 0.75rem;', 'font-size: 14px;')
html = html.replace('font-size: 0.9rem;', 'font-size: 18px;')

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/phonebook.html', 'w', encoding='utf-8') as f:
    f.write(html)

