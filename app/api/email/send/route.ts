import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: '이메일을 입력해주세요.' }, { status: 400 });
        }

        // Generate a 6 digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const exp = Date.now() + 3 * 60 * 1000; // 3 minutes expiration

        // Create a signature to verify later statelessly
        const secret = process.env.OTP_SECRET || 'sejongcook-default-secret';
        const payload = `${email}:${code}:${exp}`;
        const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

        // Create SMTP transporter
        // User must set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local
        // If not set, we'll log it for debugging and simulate success (for local dev)
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            const transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.naver.com',
                port: Number(process.env.SMTP_PORT) || 465,
                secure: true,
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });

            await transporter.sendMail({
                from: `"세종요리제과기술학원" <${process.env.SMTP_USER}>`,
                to: email,
                subject: '[세종요리제과기술학원] 이메일 인증 번호입니다.',
                html: `
                    <div style="padding: 20px; border: 1px solid #ddd; max-width: 500px;">
                        <h2 style="color: #d97706;">세종요리제과기술학원</h2>
                        <p>안녕하세요.</p>
                        <p>요청하신 이메일 인증 번호는 다음과 같습니다.</p>
                        <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                            ${code}
                        </div>
                        <p>이 번호는 3분 동안 유효합니다.</p>
                    </div>
                `,
            });
        } else {
            console.log(`[DEBUG - Email Not Sent] Verification code for ${email} is ${code}`);
            // In a real scenario without SMTP, you wouldn't send success, but we'll allow it for testing if SMTP is missing.
        }

        return NextResponse.json({ success: true, exp, signature });
    } catch (error) {
        console.error('Email send error:', error);
        return NextResponse.json({ error: '메일 발송에 실패했습니다.' }, { status: 500 });
    }
}
