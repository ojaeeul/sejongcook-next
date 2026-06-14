def fix_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    old_font_list = """const fontList = [
    { name: '나눔펜 스크립트 (기본)', value: 'Nanum Pen Script' },
    { name: '노토 산스 KR', value: 'Noto Sans KR' },
    { name: '고운 돋움', value: 'Gowun Dodum' },
    { name: '고운 바탕', value: 'Gowun Batang' },
    { name: '감자꽃', value: 'Gamja Flower' },
    { name: '하이 멜로디', value: 'Hi Melody' },
    { name: '주아', value: 'Jua' },
    { name: '도현', value: 'Do Hyeon' },
    { name: '흑백사진', value: 'Black And White Picture' },
    { name: '큐트 폰트', value: 'Cute Font' },
    { name: '독도', value: 'Dokdo' },
    { name: '동글', value: 'Dongle' },
    { name: '개구', value: 'Gaegu' },
    { name: '구기', value: 'Gugi' },
    { name: '푸어 스토리', value: 'Poor Story' },
    { name: '싱글 데이', value: 'Single Day' },
    { name: '송명', value: 'Song Myung' },
    { name: '스타일리시', value: 'Stylish' },
    { name: '해바라기', value: 'Sunflower' },
    { name: '연성', value: 'Yeon Sung' },
    { name: '함초롬', value: 'Hahmlet' },
    { name: '나눔 고딕', value: 'Nanum Gothic' },
    { name: '나눔 명조', value: 'Nanum Myeongjo' }
];"""

    new_font_list = """const fontList = [
    { name: '나눔펜 스크립트 (기본)', value: 'Nanum Pen Script', size: '19px' },
    { name: '노토 산스 KR', value: 'Noto Sans KR', size: '14px' },
    { name: '고운 돋움', value: 'Gowun Dodum', size: '15px' },
    { name: '고운 바탕', value: 'Gowun Batang', size: '15px' },
    { name: '감자꽃', value: 'Gamja Flower', size: '18px' },
    { name: '하이 멜로디', value: 'Hi Melody', size: '17px' },
    { name: '주아', value: 'Jua', size: '15px' },
    { name: '도현', value: 'Do Hyeon', size: '14px' },
    { name: '흑백사진', value: 'Black And White Picture', size: '18px' },
    { name: '큐트 폰트', value: 'Cute Font', size: '18px' },
    { name: '독도', value: 'Dokdo', size: '19px' },
    { name: '동글', value: 'Dongle', size: '22px' },
    { name: '개구', value: 'Gaegu', size: '17px' },
    { name: '구기', value: 'Gugi', size: '15px' },
    { name: '푸어 스토리', value: 'Poor Story', size: '16px' },
    { name: '싱글 데이', value: 'Single Day', size: '16px' },
    { name: '송명', value: 'Song Myung', size: '16px' },
    { name: '스타일리시', value: 'Stylish', size: '16px' },
    { name: '해바라기', value: 'Sunflower', size: '15px' },
    { name: '연성', value: 'Yeon Sung', size: '18px' },
    { name: '함초롬', value: 'Hahmlet', size: '14px' },
    { name: '나눔 고딕', value: 'Nanum Gothic', size: '14px' },
    { name: '나눔 명조', value: 'Nanum Myeongjo', size: '14px' }
];"""

    js = js.replace(old_font_list, new_font_list)

    # Now update applySettingsToDOM to use the size
    old_apply = """        .entry-line, .entry-line .desc-col, .entry-line .amount-col, .entry-line .method-col, .entry-line .date-col {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
            font-weight: ${weight} !important;
            ${colorStr}
        }"""
        
    new_apply = """
    const fontObj = fontList.find(f => f.value === currentSettings.fontFamily) || fontList[0];
    const fontSize = fontObj.size;
    
        .entry-line, .entry-line .desc-col, .entry-line .amount-col, .entry-line .method-col, .entry-line .date-col {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
            font-size: ${fontSize} !important;
            font-weight: ${weight} !important;
            ${colorStr}
        }"""
        
    js = js.replace(old_apply, new_apply.replace('const fontObj', 'const fontObj').replace('    const fontSize', '    const fontSize').strip('\n'))
    
    # Let's write robust replace since template strings are tricky
    import re
    js = re.sub(
        r"styleTag\.innerHTML = `[\s\S]*?\.entry-line\s*,\s*\.entry-line[\s\S]*?`\;",
        r"""    const fontObj = fontList.find(f => f.value === currentSettings.fontFamily) || fontList[0];
    const fontSizeStr = fontObj.size;
    
    styleTag.innerHTML = `
        .entry-line, .entry-line .desc-col, .entry-line .amount-col, .entry-line .method-col, .entry-line .date-col {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
            font-size: ${fontSizeStr} !important;
            font-weight: ${weight} !important;
            ${colorStr}
        }
        .page-title {
            font-family: '${currentSettings.fontFamily}', cursive, sans-serif !important;
        }
    `;""",
        js
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

fix_js('Sejong/SejongAttendance/public/expense_settings.js')
print("Settings JS updated for font sizing")
