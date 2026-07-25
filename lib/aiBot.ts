import { promises as fs } from 'fs';
import path from 'path';
import fallbackBotSettings from '@/public/data/bot_settings.json';

export async function generateQnaResponse(post: any, repliesHistory: any[] = [], board: string = 'qna') {
    try {
        // 1. 설정 파일 읽기
        let settings = { enabled: false, systemPrompt: '' };
        try {
            const filePath = path.join(process.cwd(), 'public', 'data', 'bot_settings.json');
            const fileContent = await fs.readFile(filePath, 'utf8');
            settings = JSON.parse(fileContent);
        } catch (e) {
            console.log("Bot settings fs.readFile failed. Using fallback import.");
            settings = fallbackBotSettings;
        }

        if (!settings.enabled || !settings.systemPrompt) {
            return null;
        }

        // 2. 환경 변수에서 Gemini API 키 가져오기
        const keysStr = process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY;
        if (!keysStr) {
            console.error("GEMINI_API_KEYS not found in env");
            return null;
        }
        
        // 쉼표로 분리된 키 중 무작위로 선택하여 Rate Limit 우회
        const keys = keysStr.split(',').map(k => k.trim());
        const apiKey = keys[Math.floor(Math.random() * keys.length)];

        if (!apiKey) {
            console.error("No valid Gemini API key found");
            return null;
        }

        // 3. Gemini API 호출
        // 질문 내용에서 data-replies HTML은 제외하고 순수 내용만 추출
        const cleanContent = (post.content || '').replace(/<div data-replies=.*?<\/div>$/g, '');
        const authorName = post.author && post.author !== '작성자' ? post.author : '수강생';
        let prompt = `사용자의 다음 질문/게시글에 친절하고 정확하게 답변해 주세요.\n\n작성자 이름: ${authorName}\n게시글 제목: ${post.title}\n게시글 내용: ${cleanContent}\n\n[강력한 호칭 통제 규칙]: 글을 쓴 사람을 부를 때 **절대로 "쌤" 또는 "선생님"이라고 부르지 마세요.** 반드시 "${authorName}님"이라고만 호칭해야 합니다!`;

        if (repliesHistory && repliesHistory.length > 0) {
            prompt += `\n\n[이전 대화 내역 (댓글)]\n`;
            repliesHistory.forEach(r => {
                prompt += `- ${r.author}: ${r.content}\n`;
            });
            prompt += `\n위 대화 내역을 참고하여, 마지막 댓글에 대해 'AI 매니저'로서 자연스럽게 이어서 답변해 주세요.`;
            prompt += `\n\n[중복 인사 절대 금지 (매우 중요)]: 이미 답변 내역이 있는 상태이므로 "어서오세요. ‘세종요리제과기술학원’입니다..." 와 같은 학원 첫인사 멘트는 절대로 다시 사용하지 마세요. 곧바로 본론에 대한 답변만 시작해야 합니다.`;
        }

        // 실시간 시험 일정 계산 및 주입
        const today = new Date();
        const kstOffset = 9 * 60 * 60 * 1000;
        const now = new Date(today.getTime() + (today.getTimezoneOffset() * 60000) + kstOffset);
        
        const thursdays = [];
        let daysUntilThursday = (4 - now.getDay() + 7) % 7;
        let current = new Date(now);
        current.setDate(now.getDate() + daysUntilThursday);
        
        for (let i = 0; i < 8; i++) {
            thursdays.push(new Date(current));
            current.setDate(current.getDate() + 7);
        }
        
        const format = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
        const writtenDates = thursdays.slice(0, 4).map(format).join(', ');
        const practicalDates = thursdays.filter((_, idx) => idx % 2 === 0).slice(0, 3).map(format).join(', ');
        
        prompt += `\n\n[오토봇 실시간 데이터 연동: 큐넷 최근 상시검정 접수 일정]\n` +
               `- 현재 시각 기준, 시스템에서 실시간 달력을 기반으로 산출된 다가오는 시험 접수 일정입니다.\n` +
               `- 다가오는 필기 원서접수일 (매주 목요일): ${writtenDates}\n` +
               `- 다가오는 실기 원서접수일 (격주 목요일): ${practicalDates}\n` +
               `- 답변 작성 시 위 산출된 O월 O일 날짜를 바탕으로 친절하게 대답하세요.`;

        if (board === 'review') {
            prompt += `\n\n[수강후기(Review) 답변 가이드라인]\n` +
                   `- 이 게시물은 질문(QnA)이 아니라, 학생이 작성한 '수강후기' 게시판의 글입니다.\n` +
                   `- 학생이 자격증 취득에 대한 감사글을 올렸다면, 그에 맞춰 진심으로 축하하는 글과 앞으로의 취업, 창업, 또는 전문 요리/제과제빵인으로서의 경력을 진심으로 응원하는 따뜻한 내용의 답글을 달아주세요.\n` +
                   `- 학원 수강을 통해 성장한 부분을 칭찬해주고, 앞으로도 세종요리제과기술학원이 든든한 지원군이 되겠다는 멘트를 꼭 포함하세요.\n` +
                   `- QnA 답변의 딱딱한 매뉴얼 어투(수강료 안내 등)는 전부 빼고, 학원 원장님이나 담당 선생님이 직접 제자에게 남겨주는 것처럼 아주 친근하고, 감동적이고, 따뜻한 어투로 작성해 주세요.\n` +
                   `- [호칭 주의]: 글을 쓴 수강생을 부를 때 절대로 "쌤", "선생님"이라고 부르지 마세요! 수강생을 부를 때는 반드시 "${authorName}님"이라고 불러야 합니다.`;
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
                maxOutputTokens: 4096,
            }
        };
        let response;
        let responseData;
        const models = ['gemini-1.5-flash', 'gemini-2.0-flash-exp', 'gemini-1.5-flash-latest'];
        
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
                console.error(`Gemini API error (Attempt ${i+1}, Model: ${currentModel}):`, err);
            }
        }

        if (!responseData) {
            console.error("Gemini API failed after 3 attempts.");
            return null;
        }

        const data = responseData;
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
