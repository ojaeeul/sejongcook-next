import re

def update_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    new_apply = """
    const weight = currentSettings.isBold ? 'bold' : 'normal';
    const colorStr = currentSettings.color === 'inherit' ? '' : `color: ${currentSettings.color} !important;`;
    const fontSize = FONT_SIZES[currentSettings.fontFamily] || '16px';
    
    styleTag.innerHTML = `
        .entry-line, .entry-line .desc-col, .entry-line .amount-col, .entry-line .date-col {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
            font-weight: ${weight} !important;
            font-size: ${fontSize} !important;
            ${colorStr}
        }
        .entry-line .method-col {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
            font-weight: ${weight} !important;
            font-size: calc(${fontSize} * 0.7) !important;
            ${colorStr}
        }
"""
    
    pattern = r"const weight = currentSettings\.isBold \? 'bold' : 'normal';[\s\S]*?font-weight: \$\{weight\} !important;\s*font-size: \$\{fontSize\} !important;\s*\$\{colorStr\}\s*\}"
    js = re.sub(pattern, new_apply.strip(), js)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

update_js('Sejong/SejongAttendance/public/expense_settings.js')
print("Fixed method-col scaling")
