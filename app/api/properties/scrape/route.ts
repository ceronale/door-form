import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { scrapeWasiProperty } from '@/lib/scraper/wasi-scraper'
import { createServerSupabase } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    await requireAuth()
    const serverSupabase = createServerSupabase()
    const body = await request.json()

    if (!body.url) {
      return NextResponse.json(
        { error: 'URL es requerida' },
        { status: 400 }
      )
    }

    // Validar que sea una URL de Wasi/Remax
    const url = body.url.trim()
    const isValidUrl = url.includes('wasi.co') || 
                       url.includes('info.wasi.co') || 
                       url.includes('remaxhabitat.com')
    
    if (!isValidUrl) {
      return NextResponse.json(
        { error: 'URL debe ser de Wasi (wasi.co o info.wasi.co) o Remax (remaxhabitat.com)' },
        { status: 400 }
      )
    }

    // Hacer scraping de la propiedad
    const scrapedData = await scrapeWasiProperty(url)

    // Verificar si la propiedad ya existe
    const { data: existing } = await serverSupabase
      .from('properties')
      .select('id')
      .eq('wasi_url', url)
      .single()

    if (existing) {
      return NextResponse.json(
        { 
          error: 'Esta propiedad ya existe en la base de datos',
          propertyId: existing.id 
        },
        { status: 409 }
      )
    }

    // Guardar en la base de datos
    // Construir objeto de inserción con solo los campos básicos (que siempre existen)
    const insertData: any = {
      title: scrapedData.title,
      wasi_url: scrapedData.wasiUrl,
      property_type: scrapedData.propertyType,
      bedrooms: scrapedData.bedrooms,
      bathrooms: scrapedData.bathrooms,
      parking: scrapedData.parking,
      price: scrapedData.price,
      location: scrapedData.location,
      address: scrapedData.address || null,
      description: scrapedData.description || null,
      images: scrapedData.images.length > 0 ? scrapedData.images : null,
      is_active: true,
    };

    // Agregar campos adicionales (después de ejecutar la migración SQL)
    if (scrapedData.areaConstructed) insertData.area_constructed = scrapedData.areaConstructed;
    if (scrapedData.level) insertData.level = scrapedData.level;
    if (scrapedData.constructionYear) insertData.construction_year = scrapedData.constructionYear;
    if (scrapedData.propertyStatus) insertData.property_status = scrapedData.propertyStatus;
    if (scrapedData.country) insertData.country = scrapedData.country;
    if (scrapedData.province) insertData.province = scrapedData.province;
    if (scrapedData.city) insertData.city = scrapedData.city;
    if (scrapedData.zone) insertData.zone = scrapedData.zone;
    if (scrapedData.businessType) insertData.business_type = scrapedData.businessType;
    if (scrapedData.administrationFee) insertData.administration_fee = scrapedData.administrationFee;
    if (scrapedData.internalFeatures && scrapedData.internalFeatures.length > 0) {
      insertData.internal_features = scrapedData.internalFeatures;
    }
    if (scrapedData.externalFeatures && scrapedData.externalFeatures.length > 0) {
      insertData.external_features = scrapedData.externalFeatures;
    }

    const { data, error } = await serverSupabase
      .from('properties')
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error('Error saving property:', error)
      return NextResponse.json(
        { error: 'Error al guardar la propiedad', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      property: data,
      scraped: scrapedData,
    }, { status: 201 })
  } catch (error) {
    console.error('Error in scrape:', error)
    return NextResponse.json(
      { 
        error: 'Error al hacer scraping de la propiedad',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}



