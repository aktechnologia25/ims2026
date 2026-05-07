import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

let supabase: SupabaseClient;

export async function initializeDatabase(): Promise<void> {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_KEY in environment variables');
  }

  supabase = createClient(supabaseUrl, supabaseKey);

  // Test connection
  const { data, error } = await supabase.from('products').select('count');
  if (error) {
    throw new Error(`Failed to connect to Supabase: ${error.message}`);
  }

  console.log('Connected to Supabase successfully');
}

export function getDatabase(): SupabaseClient {
  return supabase;
}
