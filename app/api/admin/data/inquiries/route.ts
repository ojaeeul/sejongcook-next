import { NextRequest, NextResponse } from 'next/server';
import { handleGet, handlePost, handlePut, handleDelete } from '@/lib/adminApiHandler';

export const GET = (req: NextRequest) => handleGet(req, 'inquiries');

export const POST = async (req: NextRequest) => {
    // Clone the request so we can read the body for the email
    // without consuming the stream before handlePost reads it.
    const reqClone = req.clone();
    
    const response = await handlePost(req, 'inquiries');
    
    if (response.ok) {
        try {
            const body = await reqClone.json();
            
            // Only send email for single item additions (not bulk array replaces from admin page)
            if (!Array.isArray(body)) {
                const emailData = {
                    name: body.name || '미입력',
                    phone: body.phone || '미입력',
                    courses: Array.isArray(body.courses) ? body.courses.join(', ') : (body.courses || '미입력'),
                    visitDate: body.visitDate ? `${body.visitDate} ${body.visitTime || ''}` : '미지정',
                    content: body.content || '없음',
                    _subject: `[세종요리제과기술학원] 새로운 수강/상담 신청 - ${body.name}님`
                };

                // Send to FormSubmit and wait for it to ensure it completes before Next.js kills the process
                await fetch('https://formsubmit.co/ajax/ojaeeul@naver.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(emailData)
                }).catch(e => console.error('FormSubmit Network Error:', e));
            }
        } catch (e) {
            console.error('Failed to parse or send email notification:', e);
        }
    }
    
    return response;
};

export const PUT = (req: NextRequest) => handlePut(req, 'inquiries');
export const DELETE = (req: NextRequest) => handleDelete(req, 'inquiries');
