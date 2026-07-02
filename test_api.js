const fs = require('fs');

async function testAnalyze() {
    const imgPath = '/Users/ojaeeul/Downloads/세종요리제과학원/무제 폴더/수정전/sejk 4/수강생 /수강생/KakaoTalk_Photo_2026-06-25-08-50-33.jpeg';
    const base64Data = fs.readFileSync(imgPath, {encoding: 'base64'});
    
    // Simulating Phonebook mode prompt
    const prompt = `이 이미지는 요리학원의 전화번호부입니다. (사진이 옆으로 누워있거나 90도 회전되어 있을 수 있으니 글씨 방향에 맞춰서 정확히 읽어주세요.)

[중요 지시사항: 2~3번 교차 검증]
이미지를 한 번만 보고 넘기지 말고, 2~3번에 걸쳐서 꼼꼼히 다시 확인하며 분석하세요.
특히 수강생 본인의 연락처와 부모님의 연락처를 절대 헷갈리지 않게 정확히 구별해서 추출하세요.

목록에서 이름과 전화번호를 추출해주세요.
- 제일 처음 적힌 번호나 관계 표시가 없는 번호는 '본인전화번호'로 분류하세요.
- 한문(母, 父)이나 한글(모, 부)로 표시된 번호는 '부모전화번호'로 분류하세요.
- 한 사람에게 전화번호가 3개 이상 있다면, 본인 번호끼리 또는 부모 번호끼리 콤마(,)로 연결해서 모두 표시하세요. (이름은 중복해서 여러 번 적지 말고 1번만 적어주세요.)

[절대 주의사항]
1. 사진에 없는 내용이나 이름(예: 김아영 등)을 절대 지어내지 마세요. (No Hallucination)
2. 글씨를 알아볼 수 없거나 비어있는 칸은 무조건 빈칸("")으로 처리하세요.

반드시 다음 JSON 형식의 배열로 반환하세요:
[
  {"이름": "민수정", "본인전화번호": "010-1243-6763, 031-888-6763", "부모전화번호": "010-3243-9286"}
]
이름이나 글씨를 절대 유추해서 획일화하지 말고, 적혀있는 그대로(예: 민지영, 민수정, 민원기, 민종훈, 문다빈, 문승희 등) 정확하게 판독하세요. 찾을 수 없으면 빈 배열 []을 반환하세요. JSON 코드 블록 없이 순수 JSON 텍스트만 출력하세요.`;

    console.log("Sending request to local API...");
    try {
        const response = await fetch('http://localhost:3000/api/sejong/ai_analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
                    ]
                }],
                generationConfig: {
                    temperature: 0.0,
                    responseMimeType: "application/json"
                }
            })
        });
        
        const text = await response.text();
        console.log("Status:", response.status);
        console.log("Response:", text);
    } catch(e) {
        console.error(e);
    }
}

testAnalyze();
