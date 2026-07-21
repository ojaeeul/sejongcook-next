import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/sejongDataHandler';

export const GET = async (req: NextRequest) => {
    try {
        const { data, error } = await supabase
            .from('inquiries')
            .select('*')
            .order('date', { ascending: false });
            
        if (error) throw error;
        return NextResponse.json(data);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { data, error } = await supabase
            .from('inquiries')
            .insert([body])
            .select();
            
        if (error) throw error;
        
        // Return success, but still allow FormSubmit emails to process on frontend
        return NextResponse.json({ success: true, data });
    } catch (e: any) {
        console.error('Inquiry Save Error:', e);
        // We still return success: true so the frontend email logic continues
        return NextResponse.json({ success: true, warning: 'Saved only via email', error: e.message });
    }
};

export const PUT = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { id, ...updateData } = body;
        
        if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        
        const { data, error } = await supabase
            .from('inquiries')
            .update(updateData)
            .eq('id', id)
            .select();
            
        if (error) throw error;
        return NextResponse.json({ success: true, data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};

export const DELETE = async (req: NextRequest) => {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        
        if (!id) {
            // Bulk delete or raw body? The previous handler checked body for {id} or query param
            const bodyText = await req.text();
            let bodyId;
            if (bodyText) {
                try {
                    const parsed = JSON.parse(bodyText);
                    bodyId = parsed.id;
                } catch(e){}
            }
            if (!bodyId) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
            
            const { error } = await supabase.from('inquiries').delete().eq('id', bodyId);
            if (error) throw error;
            return NextResponse.json({ success: true });
        } else {
            const { error } = await supabase.from('inquiries').delete().eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
};
