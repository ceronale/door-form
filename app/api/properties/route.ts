import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerSupabase } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    await requireAuth()
    const serverSupabase = createServerSupabase()
    
    const searchParams = request.nextUrl.searchParams
    const isActive = searchParams.get('is_active')
    const search = searchParams.get('search')

    let query = serverSupabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,location.ilike.%${search}%,address.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching properties:', error)
      return NextResponse.json(
        { error: 'Error al obtener propiedades' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in GET /api/properties:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const serverSupabase = createServerSupabase()
    const body = await request.json()

    const { data, error } = await serverSupabase
      .from('properties')
      .insert({
        title: body.title,
        wasi_url: body.wasiUrl,
        property_type: body.propertyType,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        parking: body.parking,
        price: body.price,
        location: body.location,
        address: body.address || null,
        description: body.description || null,
        images: body.images || [],
        is_active: body.isActive !== false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating property:', error)
      return NextResponse.json(
        { error: 'Error al crear propiedad' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/properties:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}



