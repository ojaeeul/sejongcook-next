export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No files received.' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Use a simple timestamp + sanitization for filename
        const filename = Date.now() + '_' + file.name.replace(/\s/g, '_');

        const { data, error } = await supabase.storage
            .from('public_assets')
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (error) {
            throw error;
        }

        const { data: publicUrlData } = supabase.storage.from('public_assets').getPublicUrl(filename);

        return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
