import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let supabase: SupabaseClient;
let initialized = false;

function getRequiredEnv(name: 'SUPABASE_URL' | 'SUPABASE_KEY'): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in environment variables`);
  }

  return value;
}

export async function initializeDatabase(): Promise<void> {
  if (initialized && supabase) {
    return;
  }

  const supabaseUrl = getRequiredEnv('SUPABASE_URL');
  const supabaseKey = getRequiredEnv('SUPABASE_KEY');
  supabase = createClient(supabaseUrl, supabaseKey);

  // Test connection
  const { error } = await supabase.from('products').select('id', { count: 'exact', head: true });
  if (error) {
    throw new Error(`Failed to connect to Supabase: ${error.message}`);
  }

  initialized = true;
  console.log('Connected to Supabase successfully');
}

export function getDatabase(): SupabaseClient {
  if (!supabase) {
    throw new Error('Database not initialized');
  }

  return supabase;
}
