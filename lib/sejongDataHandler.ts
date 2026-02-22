import { createClient } from '@supabase/supabase-js';

// Get environment variables for Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize Supabase client
// For Server API Routes, using Service Role is recommended if RLS is enabled,
// otherwise anon key is fine but we've disabled RLS for now.
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: false
    }
});
