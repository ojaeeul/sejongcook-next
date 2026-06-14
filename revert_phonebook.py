import re

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/phonebook.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Modify main-wrapper
html = html.replace('<main class="main-wrapper">', '<main class="main-wrapper" style="overflow-x: auto;">')

# Update notebook structure
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

# Update CSS
css_start = html.find('.notebook-wrapper {')
css_end = html.find('.notebook-tabs {')

new_css = """        .notebook-wrapper {
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding: 40px 10px 20px 10px;
            min-height: calc(100vh - 80px);
            position: relative;
        }

        .notebook {
            display: flex;
            width: 100%;
            max-width: none;
            min-width: 1200px;
            height: 850px;
            margin: auto;
            position: relative;
        }

        .page {
            flex: 1;
            position: relative;
            background: #fffdf8;
            border: 1px solid #d1d5db;
            box-shadow: 20px 20px 40px rgba(0,0,0,0.1), -5px 5px 15px rgba(0,0,0,0.05);
            background-image: repeating-linear-gradient(transparent, transparent 39px, #e2e8f0 39px, #e2e8f0 40px);
            background-position: 0 40px;
            overflow: hidden;
            padding: 30px 40px 80px 40px;
            display: flex;
            flex-direction: column;
        }

        .page-left {
            border-top-left-radius: 12px;
            border-bottom-left-radius: 12px;
            border-right: none;
        }

        .page-right {
            border-top-right-radius: 12px;
            border-bottom-right-radius: 12px;
            border-left: none;
        }

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

        """
html = html[:css_start] + new_css + html[css_end:]

# Fix notebook-tabs positioning
html = html.replace('.notebook-tabs {\n            display: flex;', '.notebook-tabs {\n            position: absolute;\n            right: -35px;\n            top: 40px;\n            display: flex;')

with open('/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/sejongcook-next/Sejong/SejongAttendance/public/phonebook.html', 'w', encoding='utf-8') as f:
    f.write(html)
