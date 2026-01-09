import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Crea un cliente de Supabase para uso en Server Components.
 * Soporta tanto los nuevos API keys (sb_publishable_...) como los legacy (anon key).
 * Prioriza los nuevos keys si están disponibles.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  // Priorizar nuevo publishable key, fallback a anon key legacy
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}

