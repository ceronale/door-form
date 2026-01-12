import { NextRequest, NextResponse } from 'next/server'
import { scrapeWasiProperty } from '@/lib/scraper/wasi-scraper'
import { improveWasiImageQuality } from '@/lib/utils/image-quality'
import JSZip from 'jszip'

/**
 * Elimina imágenes duplicadas comparando URLs normalizadas
 */
function removeDuplicateImages(imageUrls: string[]): string[] {
  const seen = new Set<string>()
  const unique: string[] = []

  for (const url of imageUrls) {
    // Normalizar URL: remover parámetros de query y fragmentos
    const normalized = url.split('?')[0].split('#')[0].trim()
    
    // Si no hemos visto esta URL normalizada, agregarla
    if (!seen.has(normalized)) {
      seen.add(normalized)
      unique.push(url)
    }
  }

  return unique
}

/**
 * Genera un documento de texto con las especificaciones de la propiedad
 */
function generateSpecificationsDocument(property: any): string {
  const lines: string[] = []
  
  lines.push('='.repeat(60))
  lines.push('ESPECIFICACIONES DE LA PROPIEDAD')
  lines.push('='.repeat(60))
  lines.push('')
  
  // Información básica
  lines.push('INFORMACIÓN BÁSICA')
  lines.push('-'.repeat(60))
  lines.push(`Título: ${property.title || 'N/A'}`)
  lines.push(`Precio: US$${property.price?.toLocaleString() || 'N/A'}`)
  lines.push(`Tipo: ${property.propertyType || 'N/A'}`)
  lines.push(`Ubicación: ${property.location || 'N/A'}`)
  if (property.address) {
    lines.push(`Dirección: ${property.address}`)
  }
  lines.push(`URL: ${property.wasiUrl || 'N/A'}`)
  lines.push('')
  
  // Características
  lines.push('CARACTERÍSTICAS')
  lines.push('-'.repeat(60))
  lines.push(`Habitaciones: ${property.bedrooms || 0}`)
  lines.push(`Baños: ${property.bathrooms || 0}`)
  lines.push(`Estacionamiento: ${property.parking || 0}`)
  if (property.areaConstructed) {
    lines.push(`Área Construida: ${property.areaConstructed} m²`)
  }
  if (property.level !== undefined) {
    lines.push(`Nivel/Piso: ${property.level}`)
  }
  if (property.constructionYear) {
    lines.push(`Año de Construcción: ${property.constructionYear}`)
  }
  if (property.propertyStatus) {
    lines.push(`Estado: ${property.propertyStatus}`)
  }
  lines.push('')
  
  // Ubicación detallada
  if (property.country || property.province || property.city || property.zone) {
    lines.push('UBICACIÓN DETALLADA')
    lines.push('-'.repeat(60))
    if (property.country) lines.push(`País: ${property.country}`)
    if (property.province) lines.push(`Provincia: ${property.province}`)
    if (property.city) lines.push(`Ciudad: ${property.city}`)
    if (property.zone) lines.push(`Zona: ${property.zone}`)
    lines.push('')
  }
  
  // Tipo de negocio
  if (property.businessType) {
    lines.push('TIPO DE NEGOCIO')
    lines.push('-'.repeat(60))
    lines.push(`${property.businessType}`)
    lines.push('')
  }
  
  // Administración
  if (property.administrationFee) {
    lines.push('ADMINISTRACIÓN')
    lines.push('-'.repeat(60))
    lines.push(`US$${property.administrationFee.toLocaleString()}`)
    lines.push('')
  }
  
  // Descripción
  if (property.description) {
    lines.push('DESCRIPCIÓN')
    lines.push('-'.repeat(60))
    const descLines = property.description.split('\n').filter((line: string) => line.trim())
    descLines.forEach((line: string) => {
      lines.push(line.trim())
    })
    lines.push('')
  }
  
  // Características internas
  if (property.internalFeatures && property.internalFeatures.length > 0) {
    lines.push('CARACTERÍSTICAS INTERNAS')
    lines.push('-'.repeat(60))
    property.internalFeatures.forEach((feature: string) => {
      lines.push(`• ${feature}`)
    })
    lines.push('')
  }
  
  // Características externas
  if (property.externalFeatures && property.externalFeatures.length > 0) {
    lines.push('CARACTERÍSTICAS EXTERNAS')
    lines.push('-'.repeat(60))
    property.externalFeatures.forEach((feature: string) => {
      lines.push(`• ${feature}`)
    })
    lines.push('')
  }
  
  // Información adicional
  lines.push('INFORMACIÓN ADICIONAL')
  lines.push('-'.repeat(60))
  lines.push(`Total de imágenes: ${property.images?.length || 0}`)
  lines.push(`Fecha de extracción: ${new Date().toLocaleString('es-VE')}`)
  lines.push('')
  
  lines.push('='.repeat(60))
  
  return lines.join('\n')
}

/**
 * Descarga una imagen desde una URL y retorna el buffer
 */
async function downloadImageBuffer(imageUrl: string): Promise<Buffer> {
  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`Error al descargar imagen: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    console.error(`Error downloading image ${imageUrl}:`, error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
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

    // Eliminar imágenes duplicadas
    const uniqueImages = removeDuplicateImages(scrapedData.images || [])

    if (uniqueImages.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron imágenes en la propiedad' },
        { status: 400 }
      )
    }

    // Crear el ZIP
    const zip = new JSZip()

    // Generar documento de especificaciones
    const specificationsText = generateSpecificationsDocument(scrapedData)
    zip.file('ESPECIFICACIONES.txt', specificationsText)

    // Descargar y agregar imágenes al ZIP
    for (let i = 0; i < uniqueImages.length; i++) {
      const imageUrl = uniqueImages[i]
      
      try {
        // Mejorar calidad de la imagen
        const highQualityUrl = improveWasiImageQuality(imageUrl, 1920, 1080)
        
        // Descargar imagen
        const imageBuffer = await downloadImageBuffer(highQualityUrl)
        
        // Determinar extensión del archivo
        let extension = 'jpg'
        try {
          const urlPath = new URL(imageUrl).pathname
          extension = urlPath.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[1] || 'jpg'
        } catch {
          // Si falla el parsing de URL, intentar desde la URL original
          const match = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)/i)
          if (match) extension = match[1]
        }
        
        // Nombre del archivo
        const sanitizedTitle = (scrapedData.title || 'propiedad')
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()
          .substring(0, 50)
        const filename = `imagen_${String(i + 1).padStart(3, '0')}_${sanitizedTitle}.${extension}`
        
        // Agregar al ZIP
        zip.file(filename, imageBuffer)
      } catch (error) {
        console.error(`Error procesando imagen ${i + 1}:`, error)
        // Continuar con las demás imágenes
      }
    }

    // Generar el ZIP como buffer
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    })

    // Retornar el ZIP como respuesta
    return new NextResponse(zipBuffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="propiedad_${scrapedData.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50) || 'descarga'}.zip"`,
      },
    })
  } catch (error) {
    console.error('Error in download-property:', error)
    return NextResponse.json(
      { 
        error: 'Error al procesar la propiedad',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
