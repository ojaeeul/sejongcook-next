
import { createClient } from '@supabase/supabase-js'

const getSupabaseConfig = () => {
    if (typeof window !== 'undefined') {
        const localUrl = localStorage.getItem('NEXT_PUBLIC_SUPABASE_URL');
        const localKey = localStorage.getItem('NEXT_PUBLIC_SUPABASE_ANON_KEY');
        if (localUrl && localKey) {
            return {
                url: localUrl,
                key: localKey
            };
        }
    }
    return {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    };
};

const { url, key } = getSupabaseConfig();

// Ensure URL is valid to prevent createClient error
const validUrl = url || 'https://placeholder.supabase.co';
const validKey = key || 'placeholder';

export const supabase = createClient(validUrl, validKey);
