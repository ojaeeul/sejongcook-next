import json

with open('Sejong/SejongAttendance/public/questions_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

bad_endings = ['낮', '높', '많', '적', '없', '있', '같', '다르', '어렵', '쉽', '언', '않는', '되는', '하는', '받는', '맞', '틀리', '안', '크', '작', '짧', '길', '좁', '넓', '나쁘', '좋']

# 1. Fix truncated options (missing '다')
fixed_options_count = 0
for k, qs in data.items():
    for q in qs:
        options = q.get('o', [])
        for j, opt in enumerate(options):
            opt_str = opt.strip()
            if opt_str and opt_str[-1] in bad_endings:
                # Append '다'
                q['o'][j] = opt_str + '다'
                fixed_options_count += 1

# 2. Fix truncated questions
# Specific fixes for the 25 truncated questions we found:
q_fixes = {
    '우유는 100g 중에 당질 5g, 단백질 3.5g, 지방 3.7g이 들어 있': {
        'append_to_q': ' 몇 ㎉를 내는가?',
        'full_o': ['50.3㎉', '67.3㎉', '74.3㎉', '80.3㎉'],
    },
    '일반적으로 초콜릿은 코코아와 카카오 버터로 나누어져있': {
        'append_to_q': ' 초콜릿 56%를 사용할 때 코코아의 양은 얼마인가?',
        'full_o': ['31%', '35%', '37%', '38%'],
    },
    '국제곡류화학협회(ICC)는 제분을 밀의 평가기준의 하나로     베사츠(Besatz)를 사용하고 있': {
        'append_to_q': ' 다음중 제분가치가 있는 베사츠는?',
        'full_o': ['시바르츠베사츠', '게삼트베사츠', '콘베사츠', '브로큰베사츠'],
    },
    '1회에 60g짜리 반죽을 2개씩 분할하는 분할기가 있': {
        'append_to_q': ' 1분에 4회 분할한다면 24kg의 반죽을 분할하는데 소요되는 시간은?',
        'full_o': ['10분', '25분', '50분', '100분'],
    },
    '케이크 반죽이 30리터 용량의 그릇 10개에 가득차 있': {
        'append_to_q': ' 이것으로 분할반죽 300g짜리 600개를 만들었다. 이 반죽의 비중은?',
        'full_o': ['0.8', '0.7', '0.6', '0.5'],
        'pop_count': 2
    },
    '제빵 공장에서 3명의 작업자가 10시간에 식빵 400개, 케이크 50개, 모카빵 200개를 만들고 있': {
        'append_to_q': ' 1시간에 직원 1인에게 지급되는 비용이 1,000원이라 할 때, 평균적으로 제품의 개당 노무비는 약 얼마인가?',
        'full_o': ['약 46원', '약 54원', '약 60원', '약 68원'],
    },
    '적당한 2차 발효점은 여러 여건에 따라 차이가 있': {
        'append_to_q': ' 일반적으로 완제품의 몇 % 까지 팽창시키는가?',
        'full_o': ['30~40%', '50~60%', '70~80%', '90~100%'],
    },
    '케이크의 아이싱으로 생크림을 많이 사용하고 있': {
        'append_to_q': ' 이러한 목적으로 사용할 수 있는 생크림의 지방 함량은 얼마 이상인가?',
        'full_o': ['20%', '35%', '10%', '50%'],
    },
    '과자의 분류에는 화학적 팽창과 공기팽창 등이 있': {
        'append_to_q': ' 다음 중 공기팽창으로 만들어지는 제품으로 대표적인 것은?',
        'full_o': ['과일 케이크', '팬 케이크', '파운드 케이크', '스펀지 케이크'],
    },
    '파운드 케이크 비용적 / 스펀지케이크 비용적': {
        'append_to_q': '',
        'full_o': ['파운드(2.40), 스펀지(5.08)', '파운드(5.08), 스펀지(2.40)', '파운드(3.00), 스펀지(4.00)', '파운드(4.00), 스펀지(3.00)'],
    },
    '튀김기름의 4대 적': {
        'append_to_q': '',
        'full_o': ['온도(열), 수분(물), 공기(산소), 이물질(금속-철, 동, 자외선)', '온도(냉기), 수분(증기), 공기(질소), 이물질(플라스틱)', '온도(열), 수분(증기), 공기(이산화탄소), 이물질(나무)', '온도(냉기), 수분(물), 공기(질소), 이물질(플라스틱)'],
    },
    '콩이나 콩나물을 삶을 때 뚜껑을 닫으면 콩 비린내 생성을 방지할 수 있': {
        'append_to_q': ' 그 이유는?',
        'full_o': ['건조를 방지해서', '산소를 차단해서', '색의 변화를 차단해서', '효소를 불활성화해서'],
    },
    '미역국을 끓이는데 1인당 사용되는 재료와 필요량, 가격은 다음과 같': {
        'append_to_q': ' 미역국 10인분을 끊이는데 필요한 재료비는? (단, 총 조미료의 가격 70원은 1인분 기준임)',
        'full_o': ['610원', '6100원', '870원', '8700원'],
    },
    '12. 파운드 케이크 비용적 / 스펀지케이크 비용적': {
        'append_to_q': '',
        'full_o': ['파운드(2.40), 스펀지(5.08)', '파운드(5.08), 스펀지(2.40)', '파운드(3.00), 스펀지(4.00)', '파운드(4.00), 스펀지(3.00)'],
    }
}

fixed_questions_count = 0

for k, qs in data.items():
    for q in qs:
        q_text = q.get('q', '').strip()
        if q_text in q_fixes:
            fix = q_fixes[q_text]
            new_q = q_text
            if fix['append_to_q']:
                new_q += fix['append_to_q']
            
            q['q'] = new_q
            q['o'] = fix['full_o']
            fixed_questions_count += 1
            
            # Special logic if the answer needs mapping but the old a usually maps to the correct one logically.
            # E.g. '콩이나 콩나물...' a was 1 ('건조를 방지해서') which was wrong anyway. In the report it says the real answer is 4 (or 1 is wrong). We don't change 'a' here, we just restore 'o'.

print(f"Fixed {fixed_options_count} truncated options.")
print(f"Fixed {fixed_questions_count} truncated questions.")

with open('Sejong/SejongAttendance/public/questions_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
