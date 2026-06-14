import re

def fix_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    # Find fontList
    font_pattern = r"const fontList = \[\s*\{[^\}]+\}(?:,\s*\{[^\}]+\})*\s*\];"
    new_font_list = """const fontList = [
    { name: '나눔펜 스크립트 (기본)', value: 'Nanum Pen Script', size: '19px' },
    { name: '나눔 브러쉬 스크립트', value: 'Nanum Brush Script', size: '19px' },
    { name: '노토 산스 KR', value: 'Noto Sans KR', size: '14px' },
    { name: '노토 세리프 KR', value: 'Noto Serif KR', size: '14px' },
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
    { name: '베이글 팻 원', value: 'Bagel Fat One', size: '15px' },
    { name: '모이라이 원', value: 'Moirai One', size: '15px' },
    { name: '가석 원', value: 'Gasoek One', size: '15px' },
    { name: '검은 고딕', value: 'Black Han Sans', size: '14px' },
    { name: '나눔 고딕', value: 'Nanum Gothic', size: '14px' },
    { name: '나눔 명조', value: 'Nanum Myeongjo', size: '14px' }
];"""
    js = re.sub(font_pattern, new_font_list, js)

    # Find PRESET_COLORS
    color_pattern = r"const PRESET_COLORS = \[\s*\{[^\}]+\}(?:,\s*\{[^\}]+\})*\s*\];"
    new_color_list = """const PRESET_COLORS = [
    { name: '기본(어두운회색)', value: 'inherit' },
    { name: '흰색', value: '#ffffff' },
    { name: '검정색', value: '#000000' },
    { name: '빨간색', value: '#ef4444' },
    { name: '주황색', value: '#f97316' },
    { name: '노란색', value: '#eab308' },
    { name: '연두색', value: '#84cc16' },
    { name: '초록색', value: '#22c55e' },
    { name: '파란색', value: '#3b82f6' },
    { name: '보라색', value: '#a855f7' },
    { name: '갈색', value: '#8b4513' },
    { name: '회색', value: '#6b7280' },
    { name: '다크 블루', value: '#1e3a8a' },
    { name: '다크 레드', value: '#7f1d1d' },
    { name: '다크 그린', value: '#14532d' },
    { name: '다크 퍼플', value: '#4c1d95' },
    { name: '진한 브라운', value: '#78350f' }
];"""
    js = re.sub(color_pattern, new_color_list, js)

    # Handle google font loading logic for Nanum Brush Script
    js = js.replace("if (fontFamily === 'Nanum Pen Script' || fontFamily === 'Noto Sans KR') return;", "if (fontFamily === 'Nanum Pen Script') return;")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

def fix_html(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Add flex-wrap: wrap to color-presets-container
    html = html.replace('<div style="display: flex; gap: 8px; margin-bottom: 10px;" id="color-presets-container">', '<div style="display: flex; gap: 8px; margin-bottom: 10px; flex-wrap: wrap;" id="color-presets-container">')
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

fix_js('Sejong/SejongAttendance/public/expense_settings.js')
fix_html('Sejong/SejongAttendance/public/expense.html')
print("Fonts and Colors updated!")
