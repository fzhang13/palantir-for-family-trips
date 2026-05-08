import { createClient } from '@supabase/supabase-js'
import { env } from './env'

const supabaseUrl = env.supabaseUrl
const supabaseAnonKey = env.supabaseAnonKey

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Supabase features disabled.'
  )
}

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null
