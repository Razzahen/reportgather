
import { createClient } from '@supabase/supabase-js';

// Get environment variables or use default values from the connected project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://itmbmcdkpzfvvjdmqtnq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0bWJtY2RrcHpmdnZqZG1xdG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDIxMDUsImV4cCI6MjA1NjU3ODEwNX0.qqbiaHFje45BVjxAZz7AidDOS4DSqqL54Mo3Zhl_JaI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
