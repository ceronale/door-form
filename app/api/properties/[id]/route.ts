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
      .from('properties')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Propiedad no encontrada' },
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
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const serverSupabase = createServerSupabase()
    const body = await request.json()

    const { data, error } = await serverSupabase
      .from('properties')
      .update({
        title: body.title,
        wasi_url: body.wasiUrl,
        property_type: body.propertyType,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        parking: body.parking,
        price: body.price,
        location: body.location,
        address: body.address,
        description: body.description,
        images: body.images,
        is_active: body.isActive,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: 'Error al actualizar propiedad' },
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
  { params }: { params: { id: string } }
) {
  try {
    await requireAuth()
    const serverSupabase = createServerSupabase()

    const { error } = await serverSupabase
      .from('properties')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Error al eliminar propiedad' },
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



