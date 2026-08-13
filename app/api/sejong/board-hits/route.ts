import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/sejongDataHandler';

const DATA_FILE = path.join(process.cwd(), 'Sejong', 'SejongAttendance', 'public', 'data', 'board_hits.json');
const SUPABASE_BOARDS = ['qna', 'review', 'job-openings', 'job-seekers', 'notice'];

function getSupabaseTableName(board: string) {
    return board.replace(/-/g, '_');
}

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
    
    if (boardCode && SUPABASE_BOARDS.includes(boardCode)) {
        return NextResponse.json({});
    }
    
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
        
        if (SUPABASE_BOARDS.includes(boardCode)) {
            const tableName = getSupabaseTableName(boardCode);
            // Fetch current
            const { data, error } = await supabase.from(tableName).select('*').eq('id', idx).single();
            if (error || !data) {
                return NextResponse.json({ error: 'Not found' }, { status: 404 });
            }
            
            let newHit = 0;
            if (boardCode === 'job-openings' || boardCode === 'job-seekers') {
                newHit = (parseInt(data.hits, 10) || 0) + 1;
                await supabase.from(tableName).update({ hits: newHit }).eq('id', idx);
            } else {
                newHit = (parseInt(data.hit, 10) || 0) + 1;
                await supabase.from(tableName).update({ hit: String(newHit) }).eq('id', idx);
            }
            
            return NextResponse.json({ success: true, hit: 1 });
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
