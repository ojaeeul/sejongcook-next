import re

def update_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    # Add a size adjustment map
    size_map_code = """
const FONT_SIZES = {
    'Nanum Pen Script': '19px',
    'Noto Sans KR': '13px',
    'Gowun Dodum': '14px',
    'Gowun Batang': '14px',
    'Gamja Flower': '18px',
    'Hi Melody': '17px',
    'Jua': '15px',
    'Do Hyeon': '14px',
    'Black And White Picture': '16px',
    'Cute Font': '18px',
    'Dokdo': '18px',
    'Dongle': '22px',
    'Gaegu': '16px',
    'Gugi': '15px',
    'Poor Story': '15px',
    'Single Day': '15px',
    'Song Myung': '15px',
    'Stylish': '16px',
    'Sunflower': '14px',
    'Yeon Sung': '16px',
    'Hahmlet': '14px',
    'Nanum Gothic': '13px',
    'Nanum Myeongjo': '14px'
};
"""
    if "const FONT_SIZES" not in js:
        js = js.replace('const PRESET_COLORS', size_map_code + '\nconst PRESET_COLORS')

    # Apply the size
    new_apply = """
    const weight = currentSettings.isBold ? 'bold' : 'normal';
    const colorStr = currentSettings.color === 'inherit' ? '' : `color: ${currentSettings.color} !important;`;
    const fontSize = FONT_SIZES[currentSettings.fontFamily] || '16px';
    
    styleTag.innerHTML = `
        .entry-line, .entry-line .desc-col, .entry-line .amount-col, .entry-line .method-col, .entry-line .date-col {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
            font-weight: ${weight} !important;
            font-size: ${fontSize} !important;
            ${colorStr}
        }
"""
    
    pattern = r"const weight = currentSettings\.isBold \? 'bold' : 'normal';[\s\S]*?font-weight: \$\{weight\} !important;\s*\$\{colorStr\}\s*\}"
    js = re.sub(pattern, new_apply.strip(), js)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

update_js('Sejong/SejongAttendance/public/expense_settings.js')
print("Fixed JS font sizes")
