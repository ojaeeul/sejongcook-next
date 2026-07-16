import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

function getFilePath(baseDir: string) {
    return path.join(process.cwd(), baseDir, 'questions_data.json');
}

export async function POST(req: NextRequest) {
    try {
        const { key, questions } = await req.json();
        if (!key || !questions) {
            return NextResponse.json({ error: "Missing key or questions" }, { status: 400 });
        }

        const masterPath = getFilePath('Sejong/SejongAttendance/public');
        
        let allData: any = {};
        if (fs.existsSync(masterPath)) {
            allData = JSON.parse(fs.readFileSync(masterPath, 'utf-8'));
        }

        allData[key] = questions;

        const updatedJson = JSON.stringify(allData, null, 4);

        // Write to the master source
        fs.writeFileSync(masterPath, updatedJson, 'utf-8');

        // Write to the next.js public directory
        const publicPath = getFilePath('public/sejong');
        if (fs.existsSync(path.dirname(publicPath))) {
            fs.writeFileSync(publicPath, updatedJson, 'utf-8');
        }
        
        // Write to Python server public directory
        const pyPublicPath = getFilePath('Sejong/public');
        if (fs.existsSync(path.dirname(pyPublicPath))) {
            fs.writeFileSync(pyPublicPath, updatedJson, 'utf-8');
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST questions-data Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
