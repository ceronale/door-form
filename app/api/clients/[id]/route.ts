import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const serverSupabase = createServerSupabase()
    const { id } = await params

    const { data, error } = await serverSupabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const serverSupabase = createServerSupabase()
    const { id } = await params
    const body = await request.json()

    const { data, error } = await serverSupabase
      .from('clients')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Error al actualizar cliente' },
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
    const serverSupabase = createServerSupabase()
    const { id } = await params

    const { error } = await serverSupabase
      .from('clients')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json(
        { error: 'Error al eliminar cliente' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}



