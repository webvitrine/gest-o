
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://idmjoqfowxzxsjjvmsru.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlkbWpvcWZvd3h6eHNqanZtc3J1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTA3ODc3MCwiZXhwIjoyMDUwNjU0NzcwfQ.IdU7Xb4UrLRkNd87Qvhv7-0jRidmfTl8UgUDqfUn6Eg';

// Only initialize if variables are present to prevent "supabaseUrl is required" crash
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
