import { createClient } from '@supabase/supabase-js';

export const getSupabaseClient = () => {
  const customUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_url') : null;
  const customKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_anon_key') : null;
  
  const supabaseUrl = customUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = customKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  return supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
};

export const supabase = getSupabaseClient()!;
