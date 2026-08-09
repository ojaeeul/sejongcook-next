import json
import re

def fix_text(text):
    if not isinstance(text, str):
        return text
    
    t = text.rstrip()
    if not t: return text

    fix_map = {
        '하': '하다.',
        '한': '한다.',
        '된': '된다.',
        '르': '르다.',
        '않': '않다.',
        '쉽': '쉽다.',
        '없': '없다.',
        '는': '는다.',
        '이': '이다.',
        '맞': '맞다.',
        '틀': '틀리다.',
        '같': '같다.',
        '높': '높다.',
        '낮': '낮다.',
        '많': '많다.',
        '적': '적다.',
        '크': '크다.',
        '작': '작다.',
        '좋': '좋다.',
        '짧': '짧다.',
        '길': '길다.',
        '가': '가?'
    }

    last_char = t[-1]
    if last_char in fix_map:
        # If it's '가' and the string is a question, append '?'
        if last_char == '가':
            return t + '?'
        else:
            return t[:-1] + fix_map[last_char]
            
    # special case for ending in "다" without punctuation
    # actually "다" is fine as is, but maybe change to "다."? Not strictly necessary.
    
    return text

def main():
    d = json.load(open('questions_data.json', 'r', encoding='utf-8'))
    changed_count = 0
    for v in d.values():
        for q in v:
            orig_q = q.get('q', '')
            fixed_q = fix_text(orig_q)
            if orig_q != fixed_q:
                print(f"Q: {orig_q}\n-> {fixed_q}\n")
                changed_count += 1

            for i, opt in enumerate(q.get('o', [])):
                orig_o = opt
                fixed_o = fix_text(orig_o)
                if orig_o != fixed_o:
                    print(f"O: {orig_o}\n-> {fixed_o}\n")
                    changed_count += 1
            
            if changed_count > 50:
                break
        if changed_count > 50:
            break
    print(f"Sampled {changed_count} changes.")

if __name__ == "__main__":
    main()
