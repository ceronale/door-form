import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const serverSupabase = createServerSupabase()

    const { data, error } = await serverSupabase
      .from('client_properties')
      .select(`
        id,
        sent_at,
        viewed_at,
        status,
        notes,
        properties (
          id,
          title,
          wasi_url,
          price,
          location,
          images
        )
      `)
      .eq('client_id', params.id)
      .order('sent_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener propiedades' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const serverSupabase = createServerSupabase()
    const body = await request.json()

    const { data, error } = await serverSupabase
      .from('client_properties')
      .insert({
        client_id: params.id,
        property_id: body.propertyId,
        notes: body.notes || null,
        status: 'sent',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Error al enviar propiedad' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}



