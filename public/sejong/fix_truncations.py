import json

def fix_text(text):
    if not isinstance(text, str):
        return text
    
    t = text.rstrip()
    if not t: return text

    fix_map = {
        '쉽': '쉽다.',
        '없': '없다.',
        '된': '된다.',
        '않': '않다.',
        '빠르': '빠르다.',
        '느리': '느리다.',
        '다르': '다르다.',
        '높': '높다.',
        '낮': '낮다.',
        '많': '많다.',
        '적': '적다.',
        '크': '크다.',
        '작': '작다.',
        '좋': '좋다.',
        '짧': '짧다.',
        '길': '길다.',
        '같': '같다.',
        '맞': '맞다.',
        '틀': '틀리다.',
        '있': '있다.',
        '한': '한다.',
        '하': '하다.',
        '는': '는다.',
        '이': '이다.'
    }

    last_char = t[-1]
    if last_char in fix_map:
        return t[:-1] + fix_map[last_char]
            
    return text

def main():
    with open('questions_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    changed = 0
    for subject, exams in data.items():
        for q in exams:
            orig_q = q.get('q', '')
            fixed_q = fix_text(orig_q)
            if orig_q != fixed_q:
                q['q'] = fixed_q
                changed += 1

            if 'o' in q:
                for i, opt in enumerate(q['o']):
                    orig_o = opt
                    fixed_o = fix_text(orig_o)
                    if orig_o != fixed_o:
                        q['o'][i] = fixed_o
                        changed += 1

    if changed > 0:
        with open('questions_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Fixed {changed} truncated texts in questions_data.json")
    else:
        print("No changes made.")

if __name__ == "__main__":
    main()
