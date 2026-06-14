def fix_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    # The current string in applySettingsToDOM is:
    #         .entry-line .method-col {
    #             font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
    #             font-size: calc(${fontSizeStr} * 0.5) !important;
    #             font-weight: ${weight} !important;
    #             ${colorStr}
    #         }
    
    old_full_rule = """        .entry-line .method-col {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
            font-size: calc(${fontSizeStr} * 0.5) !important;
            font-weight: ${weight} !important;
            ${colorStr}
        }"""
        
    new_full_rule = """        .entry-line .method-col {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
            font-size: calc(${fontSizeStr} * 0.7) !important;
            font-weight: bold !important;
            ${colorStr}
        }"""
        
    js = js.replace(old_full_rule, new_full_rule)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

fix_js('Sejong/SejongAttendance/public/expense_settings.js')
print("Fixed method-col size in JS to 0.7 and bold")
