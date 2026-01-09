import * as cheerio from 'cheerio';

export interface ScrapedProperty {
  title: string;
  price: number;
  propertyType: 'casa' | 'apartamento' | 'townhouse' | 'terreno';
  bedrooms: number;
  bathrooms: number;
  parking: number;
  location: string;
  address?: string;
  description?: string;
  images: string[];
  wasiUrl: string;
  // Campos adicionales
  areaConstructed?: number;
  level?: number;
  constructionYear?: number;
  propertyStatus?: string;
  country?: string;
  province?: string;
  city?: string;
  zone?: string;
  businessType?: string;
  administrationFee?: number;
  internalFeatures?: string[];
  externalFeatures?: string[];
}

/**
 * Normaliza el tipo de propiedad desde el texto de Wasi
 */
function normalizePropertyType(text: string): 'casa' | 'apartamento' | 'townhouse' | 'terreno' {
  const lower = text.toLowerCase();
  
  // Tipos comerciales/industriales se mapean a terreno o apartamento según contexto
  if (lower.includes('galpón') || lower.includes('galpon') || lower.includes('local comercial') || 
      lower.includes('depósito') || lower.includes('deposito') || lower.includes('piso industrial')) {
    // Para propiedades comerciales, usar terreno como tipo genérico
    return 'terreno';
  }
  
  if (lower.includes('apartamento') || lower.includes('apartment')) {
    return 'apartamento';
  }
  if (lower.includes('casa') || lower.includes('house') || lower.includes('home')) {
    return 'casa';
  }
  if (lower.includes('townhouse') || lower.includes('town house')) {
    return 'townhouse';
  }
  if (lower.includes('terreno') || lower.includes('lote') || lower.includes('parcela') || lower.includes('land')) {
    return 'terreno';
  }
  
  // Default a apartamento si no se puede determinar
  return 'apartamento';
}

/**
 * Extrae el precio del texto
 */
function extractPrice(text: string): number {
  // Buscar patrones como: US$4,200, $4,200, 4200 USD, etc.
  const priceRegex = /(?:US\$|USD|\$)\s*([\d,]+)/i;
  const match = text.match(priceRegex);
  
  if (match) {
    return parseInt(match[1].replace(/,/g, ''), 10);
  }
  
  // Buscar solo números grandes
  const numberMatch = text.match(/(\d{3,})/);
  if (numberMatch) {
    return parseInt(numberMatch[1], 10);
  }
  
  return 0;
}

/**
 * Extrae números de características (habitaciones, baños, estacionamiento)
 */
function extractNumber(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  
  for (const keyword of keywords) {
    // Buscar número antes de la palabra clave: "2 habitaciones"
    const regexBefore = new RegExp(`(\\d+)\\s*${keyword}`, 'i');
    const matchBefore = lower.match(regexBefore);
    if (matchBefore) {
      return parseInt(matchBefore[1], 10);
    }
    
    // Buscar número después de la palabra clave: "habitaciones: 2"
    const regexAfter = new RegExp(`${keyword}[^\\d]*(\\d+)`, 'i');
    const matchAfter = lower.match(regexAfter);
    if (matchAfter) {
      return parseInt(matchAfter[1], 10);
    }
  }
  
  return 0;
}

/**
 * Extrae características del formato abreviado (ej: "1h/1b/1e" = 1 habitación, 1 baño, 1 estacionamiento)
 */
function extractFromAbbreviatedFormat(text: string): { bedrooms: number; bathrooms: number; parking: number } {
  // Buscar patrones como: "1h/1b/1e", "2h/2b/2e", "3h/2.5b/1e", etc.
  const pattern = /(\d+(?:\.\d+)?)\s*h[^/]*\/(\d+(?:\.\d+)?)\s*b[^/]*\/(\d+(?:\.\d+)?)\s*e/i;
  const match = text.match(pattern);
  
  if (match) {
    return {
      bedrooms: parseInt(match[1], 10),
      bathrooms: parseFloat(match[2]),
      parking: parseInt(match[3], 10),
    };
  }
  
  // Buscar variaciones: "1hab/1baño/1est"
  const pattern2 = /(\d+)\s*hab[^/]*\/(\d+(?:\.\d+)?)\s*ba[^/]*\/(\d+)\s*est/i;
  const match2 = text.match(pattern2);
  
  if (match2) {
    return {
      bedrooms: parseInt(match2[1], 10),
      bathrooms: parseFloat(match2[2]),
      parking: parseInt(match2[3], 10),
    };
  }
  
  return { bedrooms: 0, bathrooms: 0, parking: 0 };
}

/**
 * Hace scraping de una propiedad de Wasi/Remax
 */
export async function scrapeWasiProperty(url: string): Promise<ScrapedProperty> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Error al obtener la página: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extraer título
    const title = $('meta[property="og:title"]').attr('content') || 
                  $('title').text() || 
                  'Propiedad sin título';

    // Extraer precio del título o del contenido
    let priceText = title + ' ' + $('body').text();
    
    // Buscar precio específicamente en secciones de precio
    const priceSelectors = [
      '*:contains("Precio")',
      '*:contains("precio")',
      '*:contains("Alquiler")',
      '*:contains("alquiler")',
      '*:contains("US$")',
      '*:contains("USD")',
    ];
    
    for (const selector of priceSelectors) {
      try {
        const priceElement = $(selector).first();
        if (priceElement.length > 0) {
          const elementText = priceElement.text() + ' ' + priceElement.parent().text();
          const foundPrice = extractPrice(elementText);
          if (foundPrice > 0) {
            priceText = elementText;
            break;
          }
        }
      } catch (e) {
        // Continuar con el siguiente selector
      }
    }
    
    const price = extractPrice(priceText);

    // Extraer tipo de propiedad
    const propertyTypeText = title + ' ' + ($('meta[name="Keywords"]').attr('content') || '');
    const propertyType = normalizePropertyType(propertyTypeText);

    // Extraer descripción
    let description = $('meta[property="og:description"]').attr('content') || 
                      $('meta[name="description"]').attr('content') || 
                      '';
    
    // Si no hay descripción en meta tags, buscar en el body (para info.wasi.co)
    if (!description || description.trim() === '') {
      // Buscar sección "Descripción Adicional" específicamente
      const descHeading = $('h3:contains("Descripción"), h3:contains("descripción")').first();
      
      if (descHeading.length > 0) {
        // Buscar el contenedor padre (col-md-12) que contiene la descripción
        const parentContainer = descHeading.closest('.col-md-12');
        
        if (parentContainer.length > 0) {
          const descDivs: string[] = [];
          
          // ESTRATEGIA PRINCIPAL: Buscar directamente el div.col-md-12 que contiene toda la descripción junta
          // Este es el caso más común en info.wasi.co donde todo el texto está en un solo div
          const descContainer = parentContainer.find('.col-md-12').filter((_, el) => {
            const text = $(el).text().toLowerCase();
            const hasDescText = text.includes('descripción adicional') || 
                               text.includes('se alquila') || 
                               text.includes('se vende') ||
                               text.includes('se arrienda');
            // Verificar que tiene mucho texto (más de 50 caracteres) y no tiene muchos divs hijos
            return hasDescText && $(el).text().trim().length > 50 && $(el).children('div').length < 5;
          }).first();
          
          if (descContainer.length > 0) {
            const divText = descContainer.text().trim();
            
            // Remover "Descripción Adicional" del inicio
            let cleanText = divText.replace(/^.*?descripción\s+adicional\s*/i, '').trim();
            
            // Dividir el texto en líneas basándose en patrones comunes
            const lines: string[] = [];
            
            // 1. Extraer la primera línea si comienza con "Se alquila/vende..."
            const firstLineMatch = cleanText.match(/^(Se\s+(?:alquila|vende|arrienda)\s+[^A-Z0-9]{0,100}[A-Z][^.]{0,100})/i);
            if (firstLineMatch) {
              lines.push(firstLineMatch[1].trim());
              cleanText = cleanText.replace(firstLineMatch[0], '').trim();
            }
            
            // 2. Buscar líneas que empiezan con números seguidos de unidades/características
            // Usar un patrón más simple y efectivo que busque cada línea completa
            const linePatterns = [
              /\d+\s*(?:mts?2|m²|m2|metros?\s+cuadrados?)[^A-Z0-9]*/i,  // Área: "64mts2"
              /\d+\s+amplias?\s+habitaciones?[^A-Z0-9]*/i,  // "2 amplias habitaciones"
              /\d+\s+baños?[^A-Z0-9]*/i,  // "1 baño"
              /\d+\s+puestos?\s+de\s+estacionamiento[^A-Z0-9]*/i,  // "2 puestos de estacionamiento"
              /\d+\s+habitaciones?[^A-Z0-9]*/i,  // "2 habitaciones" (sin "amplias")
              /\d+\s+dormitorios?[^A-Z0-9]*/i,  // Dormitorios
            ];
            
            const foundMatches: { text: string; position: number }[] = [];
            let processedText = cleanText;
            
            // Buscar cada patrón y extraer la línea completa
            linePatterns.forEach(pattern => {
              let match;
              while ((match = pattern.exec(cleanText)) !== null) {
                const start = match.index;
                const matchText = match[0].trim();
                
                // Buscar el final de la línea (siguiente número, mayúscula, o fin)
                let end = start + matchText.length;
                const afterText = cleanText.substring(end);
                const nextNumberOrUpper = afterText.match(/^\s*(\d+|[A-Z])/);
                
                if (nextNumberOrUpper) {
                  // La línea termina aquí
                  end = start + matchText.length;
                } else {
                  // Extender hasta encontrar un punto, coma seguida de mayúscula, o límite
                  const extendMatch = afterText.match(/^[^A-Z0-9]{0,50}(?=[A-Z]|\d|$)/);
                  if (extendMatch) {
                    end = start + matchText.length + extendMatch[0].length;
                  }
                }
                
                const fullLine = cleanText.substring(start, end).trim();
                if (fullLine.length > 0 && fullLine.length < 200) {
                  foundMatches.push({ text: fullLine, position: start });
                }
              }
            });
            
            // Ordenar por posición y agregar a lines (sin duplicados)
            foundMatches.sort((a, b) => a.position - b.position);
            const uniqueMatches: string[] = [];
            foundMatches.forEach(match => {
              if (!uniqueMatches.some(existing => existing.includes(match.text) || match.text.includes(existing))) {
                uniqueMatches.push(match.text);
                lines.push(match.text);
              }
            });
            
            // 3. Procesar el texto restante (frases que no empiezan con números)
            // Remover las líneas encontradas del texto
            uniqueMatches.forEach(match => {
              processedText = processedText.replace(match, '');
            });
            
            // Dividir el texto restante por frases que empiezan con mayúscula
            const remainingLines = processedText
              .split(/(?=[A-Z][a-z]{3,})|(?<=[.!?])\s+/)
              .map(line => line.trim().replace(/^[,.\s]+|[,.\s]+$/g, ''))
              .filter(line => line.length > 5 && line.length < 200 && !line.match(/^\d+$/));
            
            lines.push(...remainingLines);
            
            // Filtrar líneas válidas
            const filteredLines = lines
              .map(line => line.trim())
              .filter(line => 
                line.length > 0 && 
                line.length < 200 &&
                !line.toLowerCase().includes('contacte al asesor') &&
                !line.toLowerCase().includes('mostrar número') &&
                !line.toLowerCase().includes('enviar formulario') &&
                !line.toLowerCase().includes('términos de servicio') &&
                !line.toLowerCase().includes('descripción adicional') &&
                !line.match(/^[a-z]{1,3}$/i) // No palabras muy cortas
              );
            
            if (filteredLines.length > 0) {
              descDivs.push(...filteredLines);
            }
          }
          
          // Estrategia 2: Si no encontramos en el div principal, buscar el párrafo y extraer divs dentro de él
          let descParagraph = parentContainer.find('p').first();
          
          if (descDivs.length < 3) {
            if (descParagraph.length > 0) {
            // Buscar todos los divs dentro del párrafo (incluyendo anidados)
            descParagraph.find('div').each((_, el) => {
              const divElement = $(el);
              
              // Verificar si este div tiene otros divs como hijos directos
              const hasDirectDivChildren = divElement.children('div').length > 0;
              
              // Solo procesar divs hoja (sin divs hijos que contengan texto)
              if (!hasDirectDivChildren) {
                const text = divElement.text().trim();
                
                  // Filtrar divs válidos - ser más permisivo
                if (text && 
                    text.length > 0 && 
                    text.length < 500 && 
                    !text.includes('CONTACTE AL ASESOR') &&
                    !text.includes('Mostrar número') &&
                    !text.includes('Enviar Formulario') &&
                    !text.includes('TÉRMINOS DE SERVICIO') &&
                    !text.includes('data-cursor-element-id') &&
                    !text.match(/^[a-z]{1,2}$/i) && // Solo filtrar palabras de 1-2 letras
                    !text.toLowerCase().includes('descripción adicional')) { // No incluir el título de la sección
                  descDivs.push(text);
                }
              }
            });
            }
          }
          
          // Estrategia 3: Si no encontramos suficientes divs, buscar directamente en el contenedor
          // después del heading, pero solo divs que están dentro de la sección de descripción
          if (descDivs.length < 3) {
            // Buscar el siguiente elemento después del heading que contenga divs
            let currentElement = descHeading.parent();
            let foundDescSection = false;
            
            // Buscar hasta encontrar una sección con divs de descripción
            for (let i = 0; i < 5 && !foundDescSection; i++) {
              currentElement = currentElement.next();
              
              if (currentElement.length > 0) {
                // Buscar divs en este elemento
                currentElement.find('div').each((_, el) => {
                  const divElement = $(el);
                  const text = divElement.text().trim();
                  
                  // Solo tomar divs que parecen ser parte de la descripción
                  if (text && 
                      text.length > 0 && 
                      text.length < 500 && 
                      !text.includes('CONTACTE AL ASESOR') &&
                      !text.includes('Mostrar número') &&
                      !text.includes('Enviar Formulario') &&
                      !text.includes('TÉRMINOS DE SERVICIO') &&
                      !text.includes('data-cursor-element-id') &&
                      !text.match(/^[a-z]{1,2}$/i) &&
                      !text.match(/^\d+$/)) { // No solo números
                    descDivs.push(text);
                    foundDescSection = true;
                  }
                });
              } else {
                break;
              }
            }
          }
          
          // Estrategia 4: Buscar directamente en el contenedor padre todos los divs
          if (descDivs.length < 3) {
            parentContainer.find('div').each((_, el) => {
              const divElement = $(el);
              const text = divElement.text().trim();
              
              // Filtrar más agresivamente para encontrar divs de descripción
              if (text && 
                  text.length > 0 && 
                  text.length < 500 && 
                  !text.includes('CONTACTE AL ASESOR') &&
                  !text.includes('Mostrar número') &&
                  !text.includes('Enviar Formulario') &&
                  !text.includes('TÉRMINOS DE SERVICIO') &&
                  !text.includes('data-cursor-element-id') &&
                  !text.match(/^[a-z]{1,2}$/i) &&
                  !text.match(/^\d+$/) &&
                  !text.toLowerCase().includes('características') &&
                  !text.toLowerCase().includes('detalle del inmueble') &&
                  !text.toLowerCase().includes('descripción adicional')) {
                descDivs.push(text);
              }
            });
          }
          
          
          // Si encontramos divs, combinarlos
          if (descDivs.length > 0) {
            // Eliminar duplicados manteniendo el orden
            const uniqueDivs = Array.from(new Set(descDivs));
            description = uniqueDivs.join('\n');
          } else if (descParagraph && descParagraph.length > 0) {
            // Fallback: usar el texto completo del párrafo
            description = descParagraph.text().trim().replace(/\s+/g, ' ');
          }
        }
      }
      
      // Si aún no hay descripción, buscar en secciones comunes
      if (!description || description.trim() === '') {
        const descSelectors = [
          '.description',
          '.descripcion',
          '[class*="description"]',
          '[class*="descripcion"]',
          '.area-de.cription', // Selector específico de info.wasi.co
        ];
        
        for (const selector of descSelectors) {
          const container = $(selector).first();
          if (container.length > 0) {
            // Buscar el párrafo dentro del contenedor
            const p = container.find('p').first();
            if (p.length > 0) {
              const descDivs = p.find('div').map((_, el) => {
                const text = $(el).text().trim();
                return text.length > 2 && text.length < 200 ? text : null;
              }).get().filter(Boolean);
              
              if (descDivs.length > 0) {
                description = descDivs.join('\n');
                break;
              }
            }
          }
        }
      }
      
      // Si aún no hay descripción, buscar en párrafos del contenido principal
      if (!description || description.trim() === '') {
        const paragraphs = $('p').map((_, el) => $(el).text().trim()).get();
        const longParagraphs = paragraphs.filter(p => p.length > 50 && !p.includes('CONTACTE AL ASESOR'));
        if (longParagraphs.length > 0) {
          description = longParagraphs[0];
        }
      }
    }

    // Extraer ubicación - buscar en varios lugares
    let location = '';
    let jsonLdData: any = null;
    
    // Buscar en el JSON-LD primero
    const jsonLd = $('script[type="application/ld+json"]').first().html();
    if (jsonLd) {
      try {
        jsonLdData = JSON.parse(jsonLd);
        // Extraer ubicación del JSON-LD
        if (jsonLdData.address) {
          // Puede ser string o objeto
          if (typeof jsonLdData.address === 'string') {
            location = jsonLdData.address;
          } else {
            location = jsonLdData.address.addressLocality || 
                      jsonLdData.address.addressRegion || 
                      jsonLdData.address.streetAddress || '';
          }
        }
      } catch (e) {
        // Ignorar errores de parsing
      }
    }
    
    // Buscar en meta tags de ubicación
    if (!location) {
      const metaLocation = $('meta[name="Keywords"]').attr('content');
      if (metaLocation) {
        // Extraer ubicación de keywords (ej: "Bienes raíces en Venezuela Miranda, Inmuebles, casas...")
        const locationMatch = metaLocation.match(/en\s+([^,]+)/i);
        if (locationMatch) {
          location = locationMatch[1].trim();
        }
      }
    }
    
    // Si no encontramos ubicación, buscar en el título o URL
    if (!location) {
      const urlParts = url.split('/');
      // Para info.wasi.co: info.wasi.co/apartamento-alquiler-san-bernardino-caracas-libertador/9703795
      // Para remaxhabitat.com: remaxhabitat.com/.../boleita-norte-caracas-sucre/...
      let urlLocation = urlParts[urlParts.length - 2]?.replace(/-/g, ' ');
      
      // Si es info.wasi.co, la ubicación está en el penúltimo segmento
      // Formato: apartamento-alquiler-san-bernardino-caracas-libertador
      if (url.includes('info.wasi.co') && urlLocation) {
        // Extraer ubicación del formato: tipo-operacion-ubicacion1-ubicacion2-ubicacion3
        const parts = urlLocation.split(' ');
        // Las primeras 1-2 palabras suelen ser tipo y operación (ej: "apartamento alquiler")
        // Las siguientes palabras son la ubicación
        // Ejemplo: "apartamento alquiler san bernardino caracas libertador"
        // Ubicación: "San Bernardino Caracas Libertador" o solo "San Bernardino"
        if (parts.length >= 3) {
          // Saltar las primeras 2 palabras (tipo y operación) y tomar el resto
          const locationParts = parts.slice(2);
          if (locationParts.length > 0) {
            location = locationParts.map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
          } else {
            // Si no hay suficientes partes, tomar las últimas 2-3
            location = parts.slice(-2).map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
          }
        } else {
          location = urlLocation.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
        }
      } else if (urlLocation && urlLocation.length > 3) {
        location = urlLocation.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
      }
    }
    
    // Fallback a Caracas si no encontramos nada
    if (!location) {
      location = 'Caracas';
    }

    // Extraer características del cuerpo de texto y descripción
    const fullText = $('body').text();
    const descriptionText = description || fullText;
    const searchText = title + ' ' + descriptionText + ' ' + fullText;
    
    // PRIMERO: Intentar extraer del formato abreviado en el título (ej: "1h/1b/1e")
    const abbreviated = extractFromAbbreviatedFormat(title);
    let bedrooms = abbreviated.bedrooms;
    let bathrooms = abbreviated.bathrooms;
    let parking = abbreviated.parking;
    
    // Si no encontramos en formato abreviado, buscar en el texto completo
    if (bedrooms === 0 && bathrooms === 0 && parking === 0) {
      // Buscar habitaciones - ser más específico para evitar confusión con "baño"
      bedrooms = extractNumber(searchText, [
        '\\d+\\s*(?:amplias?\\s*)?habitaciones?',
        'habitaciones?[^\\d]*(\\d+)',
        'dormitorios?[^\\d]*(\\d+)',
        'bedroom[^\\d]*(\\d+)',
        '(\\d+)\\s*hab(?!\\w)', // "hab" pero no seguido de otra letra (para evitar "baño")
      ]);
      
      // Buscar baños - ser más específico, buscar "1 baño" o "baño: 1"
      const bathroomPatterns = [
        /(\d+)\s*baños?/i,  // "1 baño" o "2 baños"
        /baños?[:\s]+(\d+)/i,  // "baño: 1" o "baños: 2"
        /bathroom[:\s]+(\d+)/i,  // "bathroom: 1"
      ];
      
      for (const pattern of bathroomPatterns) {
        const match = searchText.match(pattern);
        if (match && match[1]) {
          const found = parseInt(match[1], 10);
          if (found > 0 && found < 20) { // Validar que sea un número razonable
            bathrooms = found;
            break;
          }
        }
      }
      
      // Buscar estacionamiento - ser más específico para evitar números incorrectos
      const parkingPatterns = [
        /(\d+)\s+puestos?\s+(?:de\s+)?estacionamiento/i,  // "1 Puesto de Estacionamiento"
        /(\d+)\s+estacionamientos?/i,  // "1 estacionamiento"
        /puestos?\s+(?:de\s+)?estacionamiento[:\s]+(\d+)/i,  // "puestos de estacionamiento: 1"
        /parking[:\s]+(\d+)/i,  // "parking: 1"
        /garage[:\s]+(\d+)/i,  // "garage: 1"
      ];
      
      for (const pattern of parkingPatterns) {
        const match = searchText.match(pattern);
        if (match && match[1]) {
          const found = parseInt(match[1], 10);
          if (found > 0 && found < 20) { // Validar que sea un número razonable
            parking = found;
            break;
          }
        }
      }
      
      // Si encontramos un número muy grande (probablemente un error), buscar más específicamente
      if (parking > 100) {
        // Buscar patrones más específicos como "2 puestos de estacionamiento"
        const parkingMatch = searchText.match(/(\d+)\s*(?:puestos?|estacionamientos?)\s*(?:de\s*)?(?:estacionamiento|parking|techados?)?/i);
        if (parkingMatch) {
          const foundParking = parseInt(parkingMatch[1], 10);
          if (foundParking > 0 && foundParking < 100) {
            parking = foundParking;
          }
        }
      }
    } else {
      // Si encontramos formato abreviado, verificar si hay más información en el texto
      // que pueda ser más precisa (ej: "2.5 baños" en descripción vs "2b" en título)
      const descBathrooms = extractNumber(descriptionText, [
        'baño', 'bathroom', 'bath', 'baños'
      ]);
      if (descBathrooms > bathrooms) {
        bathrooms = descBathrooms;
      }
    }
    
    // También buscar en el JSON-LD si está disponible
    if (jsonLdData && jsonLdData.numberOfRooms) {
      const rooms = parseInt(jsonLdData.numberOfRooms, 10);
      if (rooms > 0 && bedrooms === 0) {
        bedrooms = rooms;
      }
    }

    // Extraer imágenes - guardamos los links (URLs) de las imágenes
    const images: string[] = [];
    
    // 1. PRIORIDAD: Buscar imágenes en el swiper (galería principal)
    // Las imágenes están en <a class="swiper-slide"> con href o <img> dentro
    $('.swiper-slide, a.swiper-slide').each((_, el) => {
      // Primero intentar obtener del href del <a>
      const href = $(el).attr('href');
      if (href && (href.includes('image.wasi.co') || href.includes('images.wasi.co'))) {
        if (!images.includes(href)) {
          images.push(href);
        }
      }
      
      // Si no hay href, buscar en el <img> dentro del slide
      const img = $(el).find('img').first();
      if (img.length > 0) {
        const src = img.attr('src') || img.attr('data-src');
        if (src && (src.includes('image.wasi.co') || src.includes('images.wasi.co'))) {
          if (!images.includes(src)) {
            images.push(src);
          }
        }
      }
    });
    
    // 2. Imagen principal de og:image (siempre la mejor calidad)
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage && !images.includes(ogImage)) {
      images.push(ogImage);
    }
    
    // 3. Imagen del JSON-LD (puede tener mejor resolución)
    // Reutilizar jsonLdData ya parseado anteriormente
    if (jsonLdData) {
      if (jsonLdData.image && typeof jsonLdData.image === 'string') {
        const jsonImage = jsonLdData.image;
        if (jsonImage && !images.includes(jsonImage)) {
          images.push(jsonImage);
        }
      }
    }
    
    // 4. Imagen del link rel="image_src"
    const imageSrc = $('link[rel="image_src"]').attr('href');
    if (imageSrc && !images.includes(imageSrc)) {
      images.push(imageSrc);
    }
    
    // 5. PRIORIDAD: Buscar imágenes en el componente fotorama (info.wasi.co)
    // Las imágenes están en <div class="fotorama__stage__frame"> con <img class="fotorama__img">
    $('.fotorama__stage__frame, .fotorama__frame').each((_, el) => {
      const img = $(el).find('img.fotorama__img, img').first();
      if (img.length > 0) {
        const src = img.attr('src') || 
                   img.attr('data-src') || 
                   img.attr('data-lazy-src') ||
                   img.attr('data-full') ||
                   img.attr('href');
        
        if (src) {
          // Convertir URLs relativas a absolutas
          let imageUrl = src.startsWith('http') ? src : new URL(src, url).href;
          
          if (imageUrl.includes('image.wasi.co') || imageUrl.includes('images.wasi.co')) {
            if (!images.includes(imageUrl)) {
              images.push(imageUrl);
            }
          }
        }
      }
    });
    
    // También buscar en el contenedor fotorama directamente
    $('.fotorama img, .fotorama__nav__frame img').each((_, el) => {
      const src = $(el).attr('src') || 
                 $(el).attr('data-src') || 
                 $(el).attr('data-full') ||
                 $(el).attr('data-img') ||
                 $(el).attr('href');
      
      if (src) {
        let imageUrl = src.startsWith('http') ? src : new URL(src, url).href;
        if (imageUrl.includes('image.wasi.co') || imageUrl.includes('images.wasi.co')) {
          if (!images.includes(imageUrl)) {
            images.push(imageUrl);
          }
        }
      }
    });
    
    // Buscar en data attributes del contenedor fotorama
    $('.fotorama, [class*="fotorama"]').each((_, el) => {
      const dataImages = $(el).attr('data-images') || 
                        $(el).attr('data-gallery') ||
                        $(el).attr('data-photos');
      
      if (dataImages) {
        try {
          // Intentar parsear como JSON si es un array
          const parsed = JSON.parse(dataImages);
          if (Array.isArray(parsed)) {
            parsed.forEach((imgUrl: string) => {
              if (imgUrl && (imgUrl.includes('image.wasi.co') || imgUrl.includes('images.wasi.co'))) {
                if (!images.includes(imgUrl)) {
                  images.push(imgUrl);
                }
              }
            });
          }
        } catch (e) {
          // Si no es JSON, tratar como string separado por comas
          const imgUrls = dataImages.split(',').map((s: string) => s.trim());
          imgUrls.forEach((imgUrl: string) => {
            if (imgUrl && (imgUrl.includes('image.wasi.co') || imgUrl.includes('images.wasi.co'))) {
              if (!images.includes(imgUrl)) {
                images.push(imgUrl);
              }
            }
          });
        }
      }
    });
    
    // 6. Buscar más imágenes en el contenido (fallback - siempre buscar para encontrar todas)
    // Buscar todas las imágenes img que no hayamos encontrado ya
    $('img').each((_, el) => {
      const src = $(el).attr('src') || 
                  $(el).attr('data-src') || 
                  $(el).attr('data-lazy-src') ||
                  $(el).attr('data-original') ||
                  $(el).attr('data-full');
      
      if (src) {
        // Convertir URLs relativas a absolutas
        let imageUrl = src.startsWith('http') ? src : new URL(src, url).href;
        
        // Filtrar solo imágenes de wasi.co/images.wasi.co
        if ((imageUrl.includes('image.wasi.co') || imageUrl.includes('images.wasi.co')) && 
            !images.includes(imageUrl) && 
            images.length < 20) {
          images.push(imageUrl);
        }
      }
    });
    
    // Eliminar duplicados manteniendo el orden
    const uniqueImages = Array.from(new Set(images));

    // Extraer dirección si está disponible
    let address = '';
    const addressSelectors = [
      '.address',
      '.direccion',
      '[class*="address"]',
      '[class*="direccion"]',
    ];
    
    for (const selector of addressSelectors) {
      const addr = $(selector).first().text().trim();
      if (addr && addr.length > 10) {
        address = addr;
        break;
      }
    }

    // Extraer información adicional de "Detalle del Inmueble"
    let areaConstructed: number | undefined;
    let level: number | undefined;
    let constructionYear: number | undefined;
    let propertyStatus: string | undefined;
    let country: string | undefined;
    let province: string | undefined;
    let city: string | undefined;
    let zone: string | undefined;
    let businessType: string | undefined;
    let administrationFee: number | undefined;

    // Buscar en tablas o listas de detalles
    const bodyText = $('body').text();
    
    // Extraer área construida (ej: "64 m²" o "64mts2")
    const areaMatch = bodyText.match(/(?:Área Construida|Area Construida)[:\s]*(\d+(?:\.\d+)?)\s*(?:m²|mts2|m2|metros|metros cuadrados)/i) ||
                     bodyText.match(/(\d+(?:\.\d+)?)\s*(?:mts2|m²|m2)/i);
    if (areaMatch) {
      areaConstructed = parseFloat(areaMatch[1]);
    }

    // Extraer nivel
    const levelMatch = bodyText.match(/(?:Nivel|Piso)[:\s]*(\d+)/i);
    if (levelMatch) {
      level = parseInt(levelMatch[1], 10);
    }

    // Extraer año de construcción
    const yearMatch = bodyText.match(/(?:Año de construcción|Año construcción|Año)[:\s]*(\d+)/i);
    if (yearMatch) {
      constructionYear = parseInt(yearMatch[1], 10);
    }

    // Extraer estado (Usado, Nuevo, etc.)
    const statusMatch = bodyText.match(/(?:Estado)[:\s]*([^.\n]+)/i);
    if (statusMatch) {
      propertyStatus = statusMatch[1].trim();
    }

    // Extraer país
    const countryMatch = bodyText.match(/(?:País)[:\s]*([^.\n]+)/i);
    if (countryMatch) {
      country = countryMatch[1].trim();
    }

    // Extraer provincia
    const provinceMatch = bodyText.match(/(?:Provincia)[:\s]*([^.\n]+)/i);
    if (provinceMatch) {
      province = provinceMatch[1].trim();
    }

    // Extraer ciudad
    const cityMatch = bodyText.match(/(?:Ciudad)[:\s]*([^.\n]+)/i);
    if (cityMatch) {
      city = cityMatch[1].trim();
    }

    // Extraer zona
    const zoneMatch = bodyText.match(/(?:Zona)[:\s]*([^.\n]+)/i);
    if (zoneMatch) {
      zone = zoneMatch[1].trim();
    }

    // Extraer tipo de negocio (Alquiler, Venta)
    const businessMatch = bodyText.match(/(?:Negocio)[:\s]*([^.\n]+)/i) ||
                         title.match(/(alquiler|venta|arriendo)/i);
    if (businessMatch) {
      businessType = businessMatch[1].trim();
    } else if (title.toLowerCase().includes('alquiler')) {
      businessType = 'Alquiler';
    } else if (title.toLowerCase().includes('venta')) {
      businessType = 'Venta';
    }

    // Extraer administración
    const adminMatch = bodyText.match(/(?:Administración)[:\s]*(?:US\$|USD|\$)?\s*(\d+(?:,\d+)?)/i);
    if (adminMatch) {
      administrationFee = parseFloat(adminMatch[1].replace(/,/g, ''));
    }

    // Extraer características internas
    const internalFeatures: string[] = [];
    const internalKeywords = [
      'Agua', 'Aire acondicionado', 'Armarios Empotrados', 'Clósets',
      'Cocina equipada', 'Gas domiciliario', 'Habitación servicio',
      'Internet', 'Puerta eléctrica'
    ];
    
    // Buscar sección de características internas
    $('*').each((_, el) => {
      const text = $(el).text();
      if (text.includes('Características internas') || text.includes('características internas')) {
        $(el).find('li, div, span, p').each((_, item) => {
          const itemText = $(item).text().trim();
          if (itemText && itemText.length > 2 && itemText.length < 50) {
            // Verificar si es una característica conocida o similar
            const isFeature = internalKeywords.some(keyword => 
              itemText.toLowerCase().includes(keyword.toLowerCase()) ||
              keyword.toLowerCase().includes(itemText.toLowerCase())
            );
            if (isFeature && !internalFeatures.includes(itemText)) {
              internalFeatures.push(itemText);
            }
          }
        });
      }
    });

    // Si no encontramos características, buscar en el texto completo
    if (internalFeatures.length === 0) {
      internalKeywords.forEach(keyword => {
        if (bodyText.toLowerCase().includes(keyword.toLowerCase())) {
          internalFeatures.push(keyword);
        }
      });
    }

    // Extraer características externas
    const externalFeatures: string[] = [];
    const externalKeywords = [
      'Ascensor', 'Centros comerciales', 'Jardín', 'Kiosko',
      'Parqueadero inteligente', 'Parques cercanos', 'Terraza',
      'Trans. público cercano', 'Urbanización Cerrada', 'Vigilancia',
      'Zona residencial'
    ];
    
    // Buscar sección de características externas
    $('*').each((_, el) => {
      const text = $(el).text();
      if (text.includes('Características externas') || text.includes('características externas')) {
        $(el).find('li, div, span, p').each((_, item) => {
          const itemText = $(item).text().trim();
          if (itemText && itemText.length > 2 && itemText.length < 50) {
            const isFeature = externalKeywords.some(keyword => 
              itemText.toLowerCase().includes(keyword.toLowerCase()) ||
              keyword.toLowerCase().includes(itemText.toLowerCase())
            );
            // Filtrar texto que parece ser parte de la descripción, no una característica
            const isDescriptionText = itemText.toLowerCase().includes('se alquila') ||
                                      itemText.toLowerCase().includes('se vende') ||
                                      itemText.toLowerCase().includes('apartamento en') ||
                                      itemText.length > 40;
            if (isFeature && !externalFeatures.includes(itemText) && !isDescriptionText) {
              externalFeatures.push(itemText);
            }
          }
        });
      }
    });

    // Si no encontramos características, buscar en el texto completo
    if (externalFeatures.length === 0) {
      externalKeywords.forEach(keyword => {
        if (bodyText.toLowerCase().includes(keyword.toLowerCase())) {
          externalFeatures.push(keyword);
        }
      });
    }

    return {
      title: title.replace(/\s*-\s*US\$\d+.*$/i, '').trim(), // Remover precio del título
      price,
      propertyType,
      bedrooms: bedrooms || 0,
      bathrooms: bathrooms || 0,
      parking: parking || 0,
      location: location || 'Caracas',
      address: address || undefined,
      description: description.substring(0, 1000), // Limitar descripción
      images: uniqueImages.slice(0, 20), // Máximo 20 imágenes (guardamos los links)
      wasiUrl: url,
      // Campos adicionales
      areaConstructed,
      level,
      constructionYear,
      propertyStatus,
      country,
      province,
      city,
      zone,
      businessType,
      administrationFee,
      internalFeatures: internalFeatures.length > 0 ? internalFeatures : undefined,
      externalFeatures: externalFeatures.length > 0 ? externalFeatures : undefined,
    };
  } catch (error) {
    console.error('Error scraping property:', error);
    throw new Error(`Error al hacer scraping de la propiedad: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

