import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    await requireAuth()
    const serverSupabase = createServerSupabase()

    // Obtener estadísticas
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Total de clientes
    const { count: totalClients } = await serverSupabase
      .from('clients')
      .select('*', { count: 'exact', head: true })

    // Nuevos clientes hoy
    const { count: newClientsToday } = await serverSupabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString())

    // Total de propiedades activas
    const { count: totalProperties } = await serverSupabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    // Contactos pendientes (clientes nuevos sin contactar)
    const { count: pendingContacts } = await serverSupabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new')

    return NextResponse.json({
      totalClients: totalClients || 0,
      newClientsToday: newClientsToday || 0,
      totalProperties: totalProperties || 0,
      pendingContacts: pendingContacts || 0,
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}

