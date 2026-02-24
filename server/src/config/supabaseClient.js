import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load .env variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Supabase URL or Service Role Key is missing in server/.env'
  );
}

// This client uses the SERVICE_ROLE_KEY and can bypass RLS
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // This disables auto-refreshing sessions, which is good for a server
    autoRefreshToken: false,
    persistSession: false,
  },
});