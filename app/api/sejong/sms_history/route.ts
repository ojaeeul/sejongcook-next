export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'public', 'sejong', 'data', 'sms_history.json');

export async function GET() {
    try {
        if (!fs.existsSync(dataFilePath)) {
            return NextResponse.json([]);
        }
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return NextResponse.json(JSON.parse(data));
    } catch (e: any) {
        console.error("GET SMS History Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const dateStr = body.date; // e.g. "2026-05-25"
        const newMessages = body.messages.map((m: any) => ({
            ...m,
            timestamp: new Date().toISOString()
        }));

        let historyData: any[] = [];
        if (fs.existsSync(dataFilePath)) {
            historyData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        }

        const entryIndex = historyData.findIndex(d => d.date === dateStr);
        if (entryIndex > -1) {
            historyData[entryIndex].messages.push(...newMessages);
        } else {
            historyData.push({
                date: dateStr,
                messages: newMessages
            });
        }

        fs.writeFileSync(dataFilePath, JSON.stringify(historyData, null, 2), 'utf8');

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("POST SMS History Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
