export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { generateQnaResponse } from '@/lib/aiBot';

export async function GET(req: NextRequest) {
    const post = {
      "title": "양식 기능사 합격!!",
      "content": "쌤! 저 양식기능사 합격했어요, 너무 감사합니다.",
      "author": "김성태"
    };
    try {
        const start = Date.now();
        const reply = await generateQnaResponse(post, [], 'review');
        const end = Date.now();
        return NextResponse.json({ success: true, reply, timeTaken: end - start });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
