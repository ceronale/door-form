import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos básicos
    if (!body.fullName || !body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Datos requeridos faltantes' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabase()

    // Insertar cliente en la base de datos
    const { data, error } = await supabase
      .from('clients')
      .insert({
        full_name: body.fullName,
        email: body.email,
        phone: body.phone,
        property_types: body.propertyTypes || [],
        bedrooms: body.bedrooms || 2,
        bathrooms: body.bathrooms || 2,
        parking: body.parking || 1,
        budget_min: body.budgetMin || 0,
        budget_max: body.budgetMax || 0,
        locations: body.locations || [],
        preferences: body.preferences || [],
        status: 'new',
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting client:', error)
      return NextResponse.json(
        { error: 'Error al guardar el formulario', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Formulario enviado exitosamente',
        clientId: data.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in submit-form:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}



