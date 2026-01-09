import { createBrowserClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

/**
 * Crea un cliente de Supabase para uso en el navegador.
 * Soporta tanto los nuevos API keys (sb_publishable_...) como los legacy (anon key).
 * Prioriza los nuevos keys si están disponibles.
 */
export function createClientSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Priorizar nuevo publishable key, fallback a anon key legacy
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  return createBrowserClient(url, key)
}

/**
 * Crea un cliente de Supabase para uso en el servidor con privilegios elevados.
 * Soporta tanto los nuevos secret keys (sb_secret_...) como el legacy service_role key.
 * Prioriza los nuevos secret keys si están disponibles.
 */
export function createServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Priorizar nuevo secret key, fallback a service_role key legacy
  const key = process.env.SUPABASE_SECRET_KEY || 
              process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  return createClient(url, key)
}

