import { promises as fs } from 'fs';
import path from 'path';

export async function generateQnaResponse(post: any, repliesHistory: any[] = []) {
    try {
        // 1. 설정 파일 읽기
        let settings = { enabled: false, systemPrompt: '' };
        try {
            const filePath = path.join(process.cwd(), 'public', 'data', 'bot_settings.json');
            const fileContent = await fs.readFile(filePath, 'utf8');
            settings = JSON.parse(fileContent);
        } catch (e) {
            console.log("Bot settings not found or parse error. Bot disabled.");
            return null;
        }

        if (!settings.enabled || !settings.systemPrompt) {
            return null;
        }

        // 2. 환경 변수에서 Gemini API 키 가져오기
        const keysStr = process.env.GEMINI_API_KEYS;
        if (!keysStr) {
            console.error("GEMINI_API_KEYS not found in env");
            return null;
        }
        
        // 쉼표로 분리된 키 중 첫 번째 키 사용 (또는 랜덤 선택 가능)
        const keys = keysStr.split(',').map(k => k.trim());
        const apiKey = keys[0];

        if (!apiKey) {
            console.error("No valid Gemini API key found");
            return null;
        }

        // 3. Gemini API 호출
        // 질문 내용에서 data-replies HTML은 제외하고 순수 내용만 추출
        const cleanContent = (post.content || '').replace(/<div data-replies=.*?<\/div>$/g, '');
        let prompt = `사용자의 다음 질문에 친절하고 정확하게 답변해 주세요.\n\n질문 제목: ${post.title}\n질문 내용: ${cleanContent}`;

        if (repliesHistory && repliesHistory.length > 0) {
            prompt += `\n\n[이전 대화 내역 (댓글)]\n`;
            repliesHistory.forEach(r => {
                prompt += `- ${r.author}: ${r.content}\n`;
            });
            prompt += `\n위 대화 내역을 참고하여, 마지막 댓글에 대해 'AI 매니저'로서 자연스럽게 이어서 답변해 주세요.`;
        }

        const requestBody = {
            system_instruction: {
                parts: { text: settings.systemPrompt }
            },
            contents: [{
                parts: [{ text: prompt }]
            }],
            generationConfig: {
                temperature: 0.2,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const err = await response.json();
            console.error("Gemini API error:", err);
            return null;
        }

        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (replyText) {
            return replyText;
        }
        
        return null;
    } catch (error) {
        console.error("generateQnaResponse error:", error);
        return null;
    }
}
