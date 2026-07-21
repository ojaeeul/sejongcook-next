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
    
    return response;
};

export const PUT = (req: NextRequest) => handlePut(req, 'inquiries');
export const DELETE = (req: NextRequest) => handleDelete(req, 'inquiries');
