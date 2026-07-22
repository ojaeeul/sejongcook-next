import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email, code, exp, signature } = await request.json();

        if (!email || !code || !exp || !signature) {
            return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });
        }

        // Check expiration
        if (Date.now() > exp) {
            return NextResponse.json({ error: '인증 번호가 만료되었습니다. 다시 요청해주세요.' }, { status: 400 });
        }

        // Verify signature statelessly
        const secret = process.env.OTP_SECRET || 'sejongcook-default-secret';
        const payload = `${email}:${code}:${exp}`;
        const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: '인증 번호가 올바르지 않습니다.' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Email verify error:', error);
        return NextResponse.json({ error: '인증 확인에 실패했습니다.' }, { status: 500 });
    }
}
