require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

async function test() {
    // Dynamic import to support ts-node or just use tsx
    const { generateQnaResponse } = await import('./lib/aiBot.ts');
    const result = await generateQnaResponse({ title: "일식기능사", content: "비용과 수강요일을 알려주세요", author: "이**" }, [], 'qna');
    console.log("Result:", result);
}
test();
