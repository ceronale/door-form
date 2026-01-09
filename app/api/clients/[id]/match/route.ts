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

    // Obtener datos del cliente
    const { data: client, error: clientError } = await serverSupabase
      .from('clients')
      .select('*')
      .eq('id', params.id)
      .single()

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Obtener propiedades activas
    const { data: properties, error: propertiesError } = await serverSupabase
      .from('properties')
      .select('*')
      .eq('is_active', true)

    if (propertiesError) {
      return NextResponse.json(
        { error: 'Error al obtener propiedades' },
        { status: 500 }
      )
    }

    // Algoritmo de matching
    const matches = properties
      .map((property) => {
        let score = 0
        let reasons: string[] = []

        // Tipo de propiedad (40 puntos)
        if (client.property_types.includes(property.property_type)) {
          score += 40
          reasons.push('Tipo de propiedad coincide')
        }

        // Presupuesto (30 puntos)
        if (
          property.price >= client.budget_min &&
          property.price <= client.budget_max
        ) {
          score += 30
          reasons.push('Dentro del presupuesto')
        } else if (property.price < client.budget_min) {
          score += 15
          reasons.push('Por debajo del presupuesto')
        } else if (property.price <= client.budget_max * 1.1) {
          score += 10
          reasons.push('Ligeramente por encima del presupuesto')
        }

        // Habitaciones (10 puntos)
        if (property.bedrooms >= client.bedrooms) {
          score += 10
          reasons.push('Habitaciones suficientes')
        } else if (property.bedrooms >= client.bedrooms - 1) {
          score += 5
          reasons.push('Habitaciones cercanas')
        }

        // Baños (10 puntos)
        if (property.bathrooms >= client.bathrooms) {
          score += 10
          reasons.push('Baños suficientes')
        } else if (property.bathrooms >= client.bathrooms - 0.5) {
          score += 5
          reasons.push('Baños cercanos')
        }

        // Estacionamiento (5 puntos)
        if (property.parking >= client.parking) {
          score += 5
          reasons.push('Estacionamiento suficiente')
        }

        // Ubicación (5 puntos)
        if (
          client.locations.some((loc) =>
            property.location.toLowerCase().includes(loc.toLowerCase())
          )
        ) {
          score += 5
          reasons.push('Ubicación preferida')
        }

        return {
          property,
          score,
          reasons,
        }
      })
      .filter((match) => match.score > 0)
      .sort((a, b) => b.score - a.score)

    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error in match:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}



