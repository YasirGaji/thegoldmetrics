import { createClient } from '@supabase/supabase-js';

// We use the "Service Role" key because this client runs on the server (Cron Job)
// and needs permission to bypass Row Level Security to WRITE data.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase URL or Service Key');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
