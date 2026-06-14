def fix_js(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        js = f.read()

    old_parse = """    const parseDate = (dStr) => {
        const match = dStr.match(/(\d+)\/(\d+)/);
        if (!match) return 9999;
        return parseInt(match[1]) * 100 + parseInt(match[2]);
    };"""
    
    new_parse = """    const parseDate = (dStr) => {
        if (!dStr) return 9999;
        // 숫자 부분만 추출하여 유연하게 매칭 (예: " 6 / 14 (일) " -> "6", "14")
        const match = dStr.match(/(\d+)[\D]+(\d+)/);
        if (!match) return 9999;
        return parseInt(match[1]) * 100 + parseInt(match[2]);
    };"""
    
    js = js.replace(old_parse, new_parse)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js)

fix_js('Sejong/SejongAttendance/public/expense_logic.js')
