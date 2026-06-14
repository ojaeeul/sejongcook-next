def fix_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    # The current string in applySettingsToDOM is:
    #         .entry-line, .entry-line .desc-col, .entry-line .amount-col, .entry-line .method-col, .entry-line .date-col {
    #             font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
    #             font-size: ${fontSizeStr} !important;
    #             font-weight: ${weight} !important;
    #             ${colorStr}
    #         }
    
    # Let's separate .method-col
    old_css = """.entry-line, .entry-line .desc-col, .entry-line .amount-col, .entry-line .method-col, .entry-line .date-col {"""
    new_css = """.entry-line, .entry-line .desc-col, .entry-line .amount-col, .entry-line .date-col {"""
    js = js.replace(old_css, new_css)
    
    # We add a specific rule for .method-col
    old_full_rule = """        .entry-line, .entry-line .desc-col, .entry-line .amount-col, .entry-line .date-col {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
            font-size: ${fontSizeStr} !important;
            font-weight: ${weight} !important;
            ${colorStr}
        }"""
        
    new_full_rule = """        .entry-line, .entry-line .desc-col, .entry-line .amount-col, .entry-line .date-col {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
            font-size: ${fontSizeStr} !important;
            font-weight: ${weight} !important;
            ${colorStr}
        }
        .entry-line .method-col {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
            font-size: calc(${fontSizeStr} * 0.5) !important;
            font-weight: ${weight} !important;
            ${colorStr}
        }"""
        
    js = js.replace(old_full_rule, new_full_rule)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

fix_js('Sejong/SejongAttendance/public/expense_settings.js')
print("Fixed method-col size in JS")
