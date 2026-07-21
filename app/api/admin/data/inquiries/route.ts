import { NextRequest, NextResponse } from 'next/server';
import { handleGet, handlePost, handlePut, handleDelete } from '@/lib/adminApiHandler';

export const GET = (req: NextRequest) => handleGet(req, 'inquiries');

export const POST = async (req: NextRequest) => {
    let body;
    let bodyText;
    try {
        bodyText = await req.text();
        body = JSON.parse(bodyText);
    } catch (e) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    
    // Create a new request for handlePost to avoid stream already read errors
    const fakeReq = new NextRequest(req.url, {
        method: req.method,
        headers: req.headers,
        body: bodyText,
    });

    let response;
    try {
        response = await handlePost(fakeReq, 'inquiries');
    } catch (e) {
        console.warn('JSON save failed (expected on Vercel):', e);
        response = NextResponse.json({ success: true, warning: 'Saved only via email' });
    }

    // If handlePost internally caught the error and returned 500, override it for Vercel
    if (!response.ok) {
        console.warn('JSON save returned non-ok (expected on Vercel)');
        response = NextResponse.json({ success: true, warning: 'Saved only via email' });
    }
    
    // ALWAYS send email for single item additions
    if (!Array.isArray(body)) {
        const emailData = {
            name: body.name || '미입력',
            phone: body.phone || '미입력',
            courses: Array.isArray(body.courses) ? body.courses.join(', ') : (body.courses || '미입력'),
            visitDate: body.visitDate ? `${body.visitDate} ${body.visitTime || ''}` : '미지정',
            content: body.content || '없음',
            _subject: `[세종요리제과기술학원] 새로운 수강/상담 신청 - ${body.name}님`
        };

        // Send to FormSubmit for original email
        try {
            await fetch('https://formsubmit.co/ajax/ojaeeul@naver.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Referer': 'https://sejongcook.co.kr/',
                    'Origin': 'https://sejongcook.co.kr'
                },
                body: JSON.stringify(emailData)
            });
        } catch (e) {
            console.error('FormSubmit Network Error 1:', e);
        }

        // Send to FormSubmit for second email
        try {
            await fetch('https://formsubmit.co/ajax/leemisun2387@gmail.com', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Referer': 'https://sejongcook.co.kr/',
                    'Origin': 'https://sejongcook.co.kr'
                },
                body: JSON.stringify(emailData)
            });
        } catch (e) {
            console.error('FormSubmit Network Error 2:', e);
        }
    }
    
    return response;
};

export const PUT = (req: NextRequest) => handlePut(req, 'inquiries');
export const DELETE = (req: NextRequest) => handleDelete(req, 'inquiries');
