import { createClient } from '@supabase/supabase-js'

// ✅ Validate env variables early (prevents silent crashes)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// ✅ Single shared client (prevents multiple auth locks)
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      flowType: 'pkce',              // 🔥 CRITICAL
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'eggpuff-auth',
      debug: false,                 // keep false in production
    },
  }
)