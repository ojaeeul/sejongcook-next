def fix_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Find the bold checkbox label and add the extrabold one
    old_bold = """                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="setting-bold-cb">
                            <span style="font-size: 16px; color: #334155;">글자 진하게 (Bold)</span>
                        </label>"""
    new_bold = """                        <div style="display: flex; gap: 20px;">
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="setting-bold-cb">
                                <span style="font-size: 16px; color: #334155;">진하게</span>
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="setting-extrabold-cb">
                                <span style="font-size: 16px; color: #334155;">아주 진하게</span>
                            </label>
                        </div>"""
    
    html = html.replace(old_bold, new_bold)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)


def fix_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    # Add isExtraBold to currentSettings
    old_settings = """let currentSettings = {
    fontFamily: 'Nanum Pen Script',
    isBold: false,
    color: 'inherit'
};"""
    new_settings = """let currentSettings = {
    fontFamily: 'Nanum Pen Script',
    isBold: false,
    isExtraBold: false,
    color: 'inherit'
};"""
    js = js.replace(old_settings, new_settings)

    # Load from localStorage
    js = js.replace("const savedBold = localStorage.getItem('notebookIsBold');", "const savedBold = localStorage.getItem('notebookIsBold');\n    const savedExtraBold = localStorage.getItem('notebookIsExtraBold');")
    js = js.replace("if (savedBold !== null) currentSettings.isBold = savedBold === 'true';", "if (savedBold !== null) currentSettings.isBold = savedBold === 'true';\n    if (savedExtraBold !== null) currentSettings.isExtraBold = savedExtraBold === 'true';")

    # Update checkbox state
    js = js.replace("const boldCb = document.getElementById('setting-bold-cb');\n    if (boldCb) boldCb.checked = currentSettings.isBold;", "const boldCb = document.getElementById('setting-bold-cb');\n    if (boldCb) boldCb.checked = currentSettings.isBold;\n    const extraBoldCb = document.getElementById('setting-extrabold-cb');\n    if (extraBoldCb) extraBoldCb.checked = currentSettings.isExtraBold;")

    # Save to localStorage
    js = js.replace("localStorage.setItem('notebookIsBold', currentSettings.isBold);", "localStorage.setItem('notebookIsBold', currentSettings.isBold);\n    localStorage.setItem('notebookIsExtraBold', currentSettings.isExtraBold);")

    # Add event listener
    old_listener = """    const boldCb = document.getElementById('setting-bold-cb');
    if (boldCb) {
        boldCb.addEventListener('change', function(e) {
            currentSettings.isBold = e.target.checked;
            saveSettings();
            applySettingsToDOM();
        });
    }"""
    new_listener = """    const boldCb = document.getElementById('setting-bold-cb');
    if (boldCb) {
        boldCb.addEventListener('change', function(e) {
            currentSettings.isBold = e.target.checked;
            saveSettings();
            applySettingsToDOM();
        });
    }
    const extraBoldCb = document.getElementById('setting-extrabold-cb');
    if (extraBoldCb) {
        extraBoldCb.addEventListener('change', function(e) {
            currentSettings.isExtraBold = e.target.checked;
            saveSettings();
            applySettingsToDOM();
        });
    }"""
    js = js.replace(old_listener, new_listener)

    # Apply CSS
    js = js.replace("const weight = currentSettings.isBold ? 'bold' : 'normal';", "const weight = currentSettings.isExtraBold ? '900' : (currentSettings.isBold ? 'bold' : 'normal');\n    const strokeStr = currentSettings.isExtraBold ? '-webkit-text-stroke: 0.8px currentColor !important;' : (currentSettings.isBold ? '-webkit-text-stroke: 0.2px currentColor !important;' : '');")
    
    # Update style string to include strokeStr
    js = js.replace("${colorStr}\n        }", "${colorStr}\n            ${strokeStr}\n        }")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)


fix_html('Sejong/SejongAttendance/public/expense.html')
fix_js('Sejong/SejongAttendance/public/expense_settings.js')
print("Fixed extra bold")
