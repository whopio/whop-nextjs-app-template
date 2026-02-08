import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface UserData {
  id: string;
  whop_user_id: string;
  display_name: string;
  trades: any[];
  blocked_tickers: any[];
  daily_checkins: any[];
  achievements: any[];
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  whop_user_id: string;
  action: string;
  metadata?: any;
  created_at: string;
}






