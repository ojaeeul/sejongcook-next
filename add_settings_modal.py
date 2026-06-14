import re

def update_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    modal_html = """
    <!-- Settings Gear Icon -->
    <button id="notebook-settings-btn" title="노트 설정" style="position: absolute; top: 10px; right: 20px; z-index: 100; background: none; border: none; cursor: pointer; color: #64748b; padding: 5px;">
        <i class="material-icons" style="font-size: 24px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">settings</i>
    </button>

    <!-- Settings Modal -->
    <div id="notebook-settings-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); z-index: 999;"></div>
    <div id="notebook-settings-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 25px; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 1000; width: 320px; font-family: 'Noto Sans KR', sans-serif;">
        <h3 style="margin: 0 0 20px 0; font-size: 1.2rem; display: flex; justify-content: space-between; align-items: center;">
            노트 텍스트 설정
            <button onclick="document.getElementById('notebook-settings-btn').click()" style="background: none; border: none; cursor: pointer; color: #94a3b8;"><i class="material-icons">close</i></button>
        </h3>
        
        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 0.9rem;">글꼴 선택</label>
            <select id="setting-font-select" style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #cbd5e1; outline: none; font-size: 0.95rem;"></select>
        </div>
        
        <div style="margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between;">
            <label style="font-weight: 600; font-size: 0.9rem;">글자 진하게 (Bold)</label>
            <label class="switch" style="position: relative; display: inline-block; width: 44px; height: 24px;">
                <input type="checkbox" id="setting-bold-toggle" checked style="opacity: 0; width: 0; height: 0;">
                <span class="slider round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 24px;"></span>
            </label>
        </div>
        
        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 0.9rem;">글자 색상</label>
            <div style="display: flex; gap: 8px; margin-bottom: 10px;" id="color-presets-container">
                <!-- Preset buttons injected by JS -->
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="color" id="setting-color-picker" value="#000000" style="width: 40px; height: 30px; border: none; cursor: pointer; padding: 0; background: none;">
                <span style="font-size: 0.85rem; color: #64748b;">원하는 색상 직접 선택</span>
            </div>
        </div>
        
        <div style="margin-top: 25px; text-align: center;">
            <p style="font-size: 0.8rem; color: #94a3b8; margin: 0;">설정은 자동으로 저장됩니다.</p>
        </div>
    </div>
"""

    if "<!-- Settings Gear Icon -->" not in html:
        # Insert inside notebook-wrapper
        html = html.replace('<div class="notebook-wrapper">', '<div class="notebook-wrapper">\n' + modal_html)
        
    if '<script src="expense_settings.js"></script>' not in html:
        html = html.replace('</body>', '    <script src="expense_settings.js"></script>\n</body>')
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

update_html('Sejong/SejongAttendance/public/expense.html')
print("Added settings HTML")
