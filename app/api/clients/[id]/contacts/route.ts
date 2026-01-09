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
      .from('contacts')
      .select('*')
      .eq('client_id', params.id)
      .order('contact_date', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Error al obtener contactos' },
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
      .from('contacts')
      .insert({
        client_id: params.id,
        contact_type: body.contactType,
        notes: body.notes,
        next_follow_up: body.nextFollowUp || null,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Error al crear contacto' },
        { status: 500 }
      )
    }

    // Actualizar estado del cliente si es necesario
    if (body.updateStatus) {
      await serverSupabase
        .from('clients')
        .update({ status: body.updateStatus })
        .eq('id', params.id)
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}



