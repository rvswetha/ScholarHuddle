import { createClient } from '@supabase/supabase-js';

// Get your public keys from the .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or Anon Key is missing in client/.env'
  );
}

// This client uses the PUBLIC ANON KEY
export const supabase = createClient(supabaseUrl, supabaseAnonKey);