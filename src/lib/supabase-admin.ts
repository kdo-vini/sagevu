import { createClient } from '@supabase/supabase-js'

// Server-side client (service role — full access, bypasses RLS)
// Never import this in client components.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
