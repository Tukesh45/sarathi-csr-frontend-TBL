import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://mvzvizfgfsmqpclsmmsk.supabase.co'
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12enZpemZnZnNtcXBjbHNtbXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMzk1MzAsImV4cCI6MjA2NzYxNTUzMH0.bnV4xttjblormGnwQMCE-G-YcBPxWQnVpP6pDoP41k4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 