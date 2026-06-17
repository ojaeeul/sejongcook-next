import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'Sejong', 'SejongAttendance', 'public', 'practical_exam_data.json');
        if (!fs.existsSync(filePath)) {
            return NextResponse.json([]);
        }
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        return NextResponse.json(data);
    } catch (e: any) {
        console.error("GET Exams Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        // Write to the master source
        const masterPath = path.join(process.cwd(), 'Sejong', 'SejongAttendance', 'public', 'practical_exam_data.json');
        fs.writeFileSync(masterPath, JSON.stringify(data, null, 4), 'utf-8');

        // Also write to the next.js public directory to keep it in sync for immediate serving
        const publicPath = path.join(process.cwd(), 'public', 'sejong', 'practical_exam_data.json');
        if (fs.existsSync(path.dirname(publicPath))) {
            fs.writeFileSync(publicPath, JSON.stringify(data, null, 4), 'utf-8');
        }
        
        // Also write to Python server public directory
        const pyPublicPath = path.join(process.cwd(), 'Sejong', 'public', 'practical_exam_data.json');
        if (fs.existsSync(path.dirname(pyPublicPath))) {
            fs.writeFileSync(pyPublicPath, JSON.stringify(data, null, 4), 'utf-8');
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST Exams Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
