import { createClient } from '@supabase/supabase-js'

// Browser client (anon key — row-level security applies)
// Singleton to prevent multiple GoTrueClient instances in the same browser context
let _browserClient: ReturnType<typeof createClient> | null = null

export function createBrowserSupabaseClient() {
  if (typeof window === 'undefined') {
    // SSR: always create a fresh ephemeral client (no singleton needed)
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  if (!_browserClient) {
    _browserClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _browserClient
}
