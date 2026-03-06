import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const getFilePath = (fileName: string) => {
    return path.join(process.cwd(), 'data', fileName);
};

export async function GET(req: NextRequest) {
    try {
        const filePath = getFilePath('settings.json');
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ courseFees: {} });
        }
        const data = fs.readFileSync(filePath, 'utf-8');
        let settings = JSON.parse(data);
        if (!settings || (Array.isArray(settings) && settings.length === 0)) {
            settings = { courseFees: {} };
        }
        return NextResponse.json(settings);
    } catch {
        return NextResponse.json({ courseFees: {} });
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const filePath = getFilePath('settings.json');

        // Ensure data directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
