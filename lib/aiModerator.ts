import fs from 'fs';
import path from 'path';
import fallbackModeratorSettings from '@/public/data/moderator_settings.json';

export async function moderateContent(title: string, content: string, boardType: string): Promise<"SAFE" | "MILD" | "SEVERE"> {
    try {
        const settingsPath = path.join(process.cwd(), 'public', 'data', 'moderator_settings.json');
        let settings = fallbackModeratorSettings;
        if (fs.existsSync(settingsPath)) {
            settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
        }

        if (!settings.enabled) {
            return "SAFE";
        }

        const keysStr = process.env.GEMINI_API_KEYS;
        if (!keysStr) {
            console.error("GEMINI_API_KEYS not found in env");
            return "SAFE"; // API 키 없으면 패스
        }
        
        const keys = keysStr.split(',').map(k => k.trim());
        const apiKey = keys[Math.floor(Math.random() * keys.length)];

        if (!apiKey) {
            return "SAFE";
        }

        const systemInstruction = settings.systemPrompt || `당신은 구인구직 게시판의 AI 검열관입니다. 
주어진 게시글을 읽고 아래 3가지 카테고리 중 하나를 선택해 오직 단어 하나만 대문자로 출력하세요. (설명 금지)

[분류 기준]
1. SEVERE (심각한 위반): 
   - 도박, 성매매, 불법 사이트 홍보 등 범죄/불법 내용
   - 심한 욕설 및 특정인 비방, 혐오 조장
2. MILD (가벼운 위반):
   - **정상적인 구인/구직 내용이 아닌 모든 글**
   - 예: "ㅋㅋ", "ㅎㅎ", "테스트", 의미없는 문자열 나열
   - 단순 일반 광고나 스팸 홍보글
3. SAFE (정상):
   - 명확한 구인, 구직, 채용 문의 등 업무와 관련된 정상적인 게시글

[엄격한 룰]
게시글 내용이 직업, 채용, 아르바이트, 근무 조건 등과 전혀 무관하다면 **무조건 MILD**를 출력하세요. (예: 단순히 웃기만 하거나 장난을 치는 글은 모두 MILD 입니다.)

[예시]
제목: 불법 도박장 직원 구함 -> SEVERE
제목: ㅋㅋㅋㅋ 내용: ㅎㅎㅎㅎ -> MILD
제목: 조리사 구합니다 -> SAFE

반드시 SAFE, MILD, SEVERE 셋 중 하나만 출력해야 합니다.`;

        const prompt = `${systemInstruction}\n\n[입력된 게시글]\n제목: ${title}\n내용: ${content || ''}`;

        const requestBody = {
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 1000,
            }
        };

        let response;
        let responseData;
        const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
        
        for (let i = 0; i < 3; i++) {
            const currentKey = keys[Math.floor(Math.random() * keys.length)];
            const currentModel = models[i % models.length];
            
            response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${currentKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (response.ok) {
                responseData = await response.json();
                break;
            } else {
                const err = await response.json();
                console.error(`Gemini AI Moderator Error (Attempt ${i+1}, Model: ${currentModel}):`, err);
            }
        }

        if (!responseData) {
            console.error("Gemini AI Moderator failed after 3 attempts.");
            return "SAFE";
        }

        const data = responseData;
        // console.log("Full Gemini Data:", JSON.stringify(data, null, 2));
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()?.toUpperCase() || "SAFE";
        console.log("Raw Gemini Response:", resultText);

        if (resultText.includes("SEVERE")) return "SEVERE";
        if (resultText.includes("MILD")) return "MILD";
        return "SAFE";

    } catch (error) {
        console.error("moderateContent error:", error);
        return "SAFE";
    }
}
