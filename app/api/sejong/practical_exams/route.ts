import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/sejongDataHandler';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 1. First check Supabase cloud storage (primary for Vercel / Web)
        const { data: cloudData, error } = await supabase
            .from('settings')
            .select('value')
            .eq('key', 'practical_exam_data')
            .maybeSingle();

        if (!error && cloudData && Array.isArray(cloudData.value) && cloudData.value.length > 0) {
            return NextResponse.json(cloudData.value);
        }

        // 2. Fallback to local file if Supabase is empty (for initial migration)
        const filePath = path.join(process.cwd(), 'Sejong', 'SejongAttendance', 'public', 'practical_exam_data.json');
        if (!fs.existsSync(filePath)) {
            return NextResponse.json([]);
        }
        const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

        // Automatically sync initial local data to Supabase
        if (Array.isArray(data) && data.length > 0) {
            try {
                await supabase.from('settings').upsert(
                    { key: 'practical_exam_data', value: data },
                    { onConflict: 'key' }
                );
            } catch (dbErr) {
                console.error("Supabase initial sync error:", dbErr);
            }
        }

        return NextResponse.json(data);
    } catch (e: unknown) {
        const err = e as Error;
        console.error("GET Practical Exams Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();

        let newExamsArray: unknown[] = [];
        
        if (Array.isArray(payload)) {
            // Legacy client support
            newExamsArray = payload;
        } else {
            // Single exam submission
            // Fetch current data from Supabase
            const { data: cloudData } = await supabase
                .from('settings')
                .select('value')
                .eq('key', 'practical_exam_data')
                .maybeSingle();
                
            let existingExams: Record<string, unknown>[] = [];
            if (cloudData && Array.isArray(cloudData.value)) {
                existingExams = cloudData.value as Record<string, unknown>[];
            }
            
            // Remove previous attempt for same user & exam, and append new
            existingExams = existingExams.filter(e => !(e.phone === payload.phone && e.examKey === payload.examKey));
            existingExams.push(payload);
            newExamsArray = existingExams;
        }

        // 1. Save to Supabase cloud storage (permanent storage for Vercel / Web)
        try {
            await supabase.from('settings').upsert(
                { key: 'practical_exam_data', value: newExamsArray },
                { onConflict: 'key' }
            );
        } catch (dbErr) {
            console.error("Supabase save error:", dbErr);
        }

        // 2. Also save to local filesystem if available (for local development & backup sync)
        try {
            const masterPath = path.join(process.cwd(), 'Sejong', 'SejongAttendance', 'public', 'practical_exam_data.json');
            if (fs.existsSync(path.dirname(masterPath))) {
                fs.writeFileSync(masterPath, JSON.stringify(newExamsArray, null, 4), 'utf-8');
            }

            const publicPath = path.join(process.cwd(), 'public', 'sejong', 'practical_exam_data.json');
            if (fs.existsSync(path.dirname(publicPath))) {
                fs.writeFileSync(publicPath, JSON.stringify(newExamsArray, null, 4), 'utf-8');
            }
            
            const pyPublicPath = path.join(process.cwd(), 'Sejong', 'public', 'practical_exam_data.json');
            if (fs.existsSync(path.dirname(pyPublicPath))) {
                fs.writeFileSync(pyPublicPath, JSON.stringify(newExamsArray, null, 4), 'utf-8');
            }
        } catch (_fsErr) {
            // Read-only filesystem on Vercel lambda - ignore
        }

        return NextResponse.json({ success: true });
    } catch (e: unknown) {
        const err = e as Error;
        console.error("POST Practical Exams Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
