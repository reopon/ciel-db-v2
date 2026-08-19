import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!

// Server-only client. All data access now goes through Server Components
// and Server Actions, so the anon key never needs to ship to the browser.
export function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseKey)
}
