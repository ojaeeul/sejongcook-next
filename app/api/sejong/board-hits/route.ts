import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'Sejong', 'SejongAttendance', 'public', 'data', 'board_hits.json');

function readHits() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error("Error reading hits:", e);
    }
    return {};
}

function writeHits(data: any) {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
        console.error("Error writing hits:", e);
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const boardCode = searchParams.get('boardCode');
    
    const hits = readHits();
    if (boardCode) {
        return NextResponse.json(hits[boardCode] || {});
    }
    return NextResponse.json(hits);
}

export async function POST(request: Request) {
    try {
        const { boardCode, idx } = await request.json();
        if (!boardCode || !idx) {
            return NextResponse.json({ error: 'Missing boardCode or idx' }, { status: 400 });
        }
        
        const hits = readHits();
        if (!hits[boardCode]) {
            hits[boardCode] = {};
        }
        
        // Increment the hit count
        hits[boardCode][idx] = (hits[boardCode][idx] || 0) + 1;
        writeHits(hits);
        
        return NextResponse.json({ success: true, hit: hits[boardCode][idx] });
    } catch (error) {
        console.error("POST board-hits error:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
