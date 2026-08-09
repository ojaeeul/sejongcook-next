import json

def main():
    with open('questions_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    changed = False
    for subject, exams in data.items():
        for q in exams:
            if "잔치국수 100그릇을 만드는 재료내역이 아래표와 같을 때" in q['q']:
                q['q'] = "잔치국수 100그릇을 만드는 재료내역이 아래표와 같을 때 한 그릇의 재료비는 얼마인가? (단, 폐기율은 0%로 가정하고 총양념비는 100그릇에 필요한 양념의 총액을 의미한다) <그림>"
                if len(q['o']) > 0 and q['o'][0].startswith(')'):
                    q['o'][0] = "1025원"
                changed = True

    if changed:
        with open('questions_data.json', 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print("Fixed questions_data.json")
    else:
        print("No changes made.")

if __name__ == "__main__":
    main()
