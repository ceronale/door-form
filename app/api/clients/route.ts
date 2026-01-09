import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const serverSupabase = createServerSupabase()
    
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'last_contact' // 'last_contact', 'created_at', 'name'

    // Primero obtenemos todos los clientes con sus datos
    let query = serverSupabase
      .from('clients')
      .select('*')

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
    }

    const { data: clients, error } = await query

    if (error) {
      console.error('Error fetching clients:', error)
      return NextResponse.json(
        { error: 'Error al obtener clientes' },
        { status: 500 }
      )
    }

    if (!clients || clients.length === 0) {
      return NextResponse.json([])
    }

    // Obtener la última fecha de contacto y conteo de propiedades para cada cliente
    const clientIds = clients.map(c => c.id)
    
    // Última fecha de contacto
    const { data: lastContacts } = await serverSupabase
      .from('contacts')
      .select('client_id, contact_date')
      .in('client_id', clientIds)
      .order('contact_date', { ascending: false })

    // Conteo de propiedades enviadas
    const { data: propertiesCount } = await serverSupabase
      .from('client_properties')
      .select('client_id')
      .in('client_id', clientIds)

    // Crear mapas
    const lastContactMap = new Map<string, string>()
    if (lastContacts) {
      lastContacts.forEach(contact => {
        if (!lastContactMap.has(contact.client_id)) {
          lastContactMap.set(contact.client_id, contact.contact_date)
        }
      })
    }

    const propertiesCountMap = new Map<string, number>()
    if (propertiesCount) {
      propertiesCount.forEach(cp => {
        const current = propertiesCountMap.get(cp.client_id) || 0
        propertiesCountMap.set(cp.client_id, current + 1)
      })
    }

    // Agregar datos adicionales a cada cliente
    const clientsWithData = clients.map(client => ({
      ...client,
      last_contact_date: lastContactMap.get(client.id) || null,
      properties_sent_count: propertiesCountMap.get(client.id) || 0
    }))

    // Ordenar según el parámetro sortBy
    let sortedClients = [...clientsWithData]
    
    if (sortBy === 'last_contact') {
      sortedClients.sort((a, b) => {
        // Clientes con contacto reciente primero
        if (a.last_contact_date && !b.last_contact_date) return -1
        if (!a.last_contact_date && b.last_contact_date) return 1
        if (a.last_contact_date && b.last_contact_date) {
          return new Date(b.last_contact_date).getTime() - new Date(a.last_contact_date).getTime()
        }
        // Si no tienen contacto, ordenar por fecha de creación
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
    } else if (sortBy === 'created_at') {
      sortedClients.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    } else if (sortBy === 'name') {
      sortedClients.sort((a, b) => 
        a.full_name.localeCompare(b.full_name)
      )
    }

    return NextResponse.json(sortedClients)
  } catch (error) {
    console.error('Error in GET /api/clients:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}



