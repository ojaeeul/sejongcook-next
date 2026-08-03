import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getFilePath(baseDir: string) {
    return path.join(process.cwd(), baseDir, 'questions.json');
}

export async function GET(req: NextRequest) {
    try {
        const filePath = getFilePath('Sejong/SejongAttendance/public');
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            return NextResponse.json(data);
        } else {
            // Vercel fallback: fetch from public CDN
            const host = req.headers.get('host') || req.nextUrl.host;
            const protocol = host?.includes('localhost') ? 'http' : 'https';
            const url = `${protocol}://${host}/sejong/questions.json`;
            const res = await fetch(url, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                return NextResponse.json(data);
            } else {
                return NextResponse.json([]);
            }
        }
    } catch (e: any) {
        console.error("GET Questions Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Write to the master source
        const masterPath = getFilePath('Sejong/SejongAttendance/public');
        fs.writeFileSync(masterPath, JSON.stringify(data, null, 4), 'utf-8');

        // Also write to the next.js public directory
        const publicPath = getFilePath('public/sejong');
        if (fs.existsSync(path.dirname(publicPath))) {
            fs.writeFileSync(publicPath, JSON.stringify(data, null, 4), 'utf-8');
        }
        
        // Also write to Python server public directory
        const pyPublicPath = getFilePath('Sejong/public');
        if (fs.existsSync(path.dirname(pyPublicPath))) {
            fs.writeFileSync(pyPublicPath, JSON.stringify(data, null, 4), 'utf-8');
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST Questions Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
