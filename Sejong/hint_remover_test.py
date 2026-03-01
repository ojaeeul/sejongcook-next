import re
import json

def remove_hints(text):
    # Pattern: remove parentheses containing Korean characters
    # Examples: (공식: ...), (소금물), (숨이 죽음), (일반적 냉장)
    # Also handles cases like "text (hint)" or "text(hint)"
    pattern = r'\s?\([^)]*[\uac00-\ud7af][^)]*\)'
    return re.sub(pattern, '', text)

# Test cases
test_cases = [
    "냉동실 온도가 -18℃일 때, 이를 화씨(℉)로 환산하면? (공식: 섭씨×1.8 + 32)",
    "비중 선별법(소금물)",
    "0~10℃ (일반적 냉장)",
    "돼지고기와 그 부산물(젤라틴, 라드 등)은 절대 금지되며",
    "알코올은 요리에 사용하더라도 가열하여 날리면 허용된다. (엄격한 할랄에서는 알코올 첨가 자체를 기피함, 다만 0.5% 미만 등 기준 상이하나 원칙적 금지)",
    "해산물은 비늘이 없는 생선(오징어, 문어 등)도 모든 이슬람 학파에서 금지한다. (학파마다 다름, 시아파는 금지하나 수니파 일부는 허용)",
    "할랄(Halal) 인증",
    "Trimethylamine",
    "해동 손실률(%)은?",
    "배추 내부의 수분이 밖으로 빠져나와 조직이 연해지고(숨이 죽음)"
]

print("--- Test Results ---")
for tc in test_cases:
    print(f"Original: {tc}")
    print(f"Fixed:    {remove_hints(tc)}")
    print("-" * 20)

# Process files
def process_file(filepath, is_js=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if is_js:
        # JS file - we need to be careful with the prefix "window.EXAM_DATA_DB = "
        # We can treat the whole thing as a string and use re.sub on the values
        # Or parse as JSON if possible
        json_part = content.replace('window.EXAM_DATA_DB = ', '', 1).rstrip(';')
        try:
            data = json.loads(json_part)
        except:
            # Fallback to lines if it's too complex
            print(f"Error parsing JS as JSON in {filepath}")
            return
    else:
        data = json.loads(content)

    def walk(obj):
        if isinstance(obj, dict):
            for k, v in obj.items():
                if isinstance(v, str):
                    obj[k] = remove_hints(v)
                else:
                    walk(v)
        elif isinstance(obj, list):
            for i in range(len(obj)):
                if isinstance(obj[i], str):
                    obj[i] = remove_hints(obj[i])
                else:
                    walk(obj[i])

    walk(data)

    output_json = json.dumps(data, ensure_ascii=False, indent=2)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        if is_js:
            f.write('window.EXAM_DATA_DB = ' + output_json + ';')
        else:
            f.write(output_json)

# process_file('public/questions_data.json')
# process_file('public/questions_data.js', True)
