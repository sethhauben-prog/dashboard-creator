// This file creates our connection to Supabase.
// Supabase handles both authentication (login/signup) and our database.
// We read the URL and key from environment variables — never hardcode secrets!
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// createClient sets up the Supabase connection we'll reuse across the whole app.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
