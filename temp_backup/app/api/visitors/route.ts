import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'visitors.json');

// Ensure directory and file exist
function initializeVisitors() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
        const initialData = {
            date: new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }),
            today: 0,
            total: 0
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
        return initialData;
    }

    try {
        const content = fs.readFileSync(DATA_FILE, 'utf-8');
        if (!content.trim()) {
            throw new Error("Empty file");
        }
        return JSON.parse(content);
    } catch (e) {
        console.error("Visitors file is corrupted or empty. Re-initializing.");
        const initialData = {
            date: new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }),
            today: 0,
            total: 0
        };
        fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
        return initialData;
    }
}

export async function GET() {
    try {
        const data = initializeVisitors();

        // Check if date has rolled over on read
        const currentDate = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
        if (data.date !== currentDate) {
            data.date = currentDate;
            data.today = 0;
            fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
        }

        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST() {
    try {
        const data = initializeVisitors();
        const currentDate = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });

        if (data.date !== currentDate) {
            // New day
            data.date = currentDate;
            data.today = 1;
            data.total += 1;
        } else {
            // Same day
            data.today += 1;
            data.total += 1;
        }

        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
