/**
 * Decodifica base64 (funciona tanto en cliente como servidor)
 */
function decodeBase64(str: string): string {
  if (typeof window === 'undefined') {
    // Servidor: usar Buffer
    return Buffer.from(str, 'base64').toString('utf-8');
  } else {
    // Cliente: usar atob
    try {
      return decodeURIComponent(
        atob(str)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      return atob(str);
    }
  }
}

/**
 * Codifica a base64 (funciona tanto en cliente como servidor)
 */
function encodeBase64(str: string): string {
  if (typeof window === 'undefined') {
    // Servidor: usar Buffer
    return Buffer.from(str, 'utf-8').toString('base64');
  } else {
    // Cliente: usar btoa
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      })
    );
  }
}

/**
 * Mejora la calidad de las imágenes de Wasi aumentando la resolución
 * Las URLs de Wasi usan base64 para codificar parámetros de resize
 */
export function improveWasiImageQuality(imageUrl: string, maxWidth: number = 1920, maxHeight: number = 1080): string {
  if (!imageUrl || !imageUrl.includes('image.wasi.co')) {
    return imageUrl;
  }

  try {
    // Extraer la parte base64 de la URL
    const urlParts = imageUrl.split('/');
    const base64Part = urlParts[urlParts.length - 1];
    
    if (!base64Part) {
      return imageUrl;
    }

    // Decodificar base64
    const decoded = decodeBase64(base64Part);
    const params = JSON.parse(decoded);

    // Mejorar los parámetros de resize solo si ya existen
    if (params.edits && params.edits.resize) {
      // Aumentar el tamaño máximo manteniendo la proporción
      const currentWidth = params.edits.resize.width || 979;
      const currentHeight = params.edits.resize.height || 743;
      
      // Calcular el ratio para mantener proporción
      const ratio = Math.min(maxWidth / currentWidth, maxHeight / currentHeight);
      
      // Solo aumentar si el ratio es mayor a 1 (imagen es más pequeña que el máximo)
      if (ratio > 1) {
        params.edits.resize.width = Math.round(currentWidth * ratio);
        params.edits.resize.height = Math.round(currentHeight * ratio);
      } else {
        // Si ya es grande, usar los máximos directamente
        params.edits.resize.width = maxWidth;
        params.edits.resize.height = maxHeight;
      }
    } else {
      // Si no hay parámetros de resize, no modificar (devolver original)
      // Esto evita problemas con URLs que no tienen parámetros de resize
      return imageUrl;
    }

    // Recodificar a base64
    const improved = encodeBase64(JSON.stringify(params));
    const improvedUrl = imageUrl.replace(base64Part, improved);
    
    return improvedUrl;
  } catch (error) {
    // Si hay error al procesar, devolver la URL original
    console.warn('Error improving image quality:', error);
    return imageUrl;
  }
}

/**
 * Obtiene una versión de alta calidad de una imagen de Wasi
 * Para uso en sliders y vistas detalladas
 */
export function getHighQualityWasiImage(imageUrl: string): string {
  return improveWasiImageQuality(imageUrl, 1920, 1080);
}

/**
 * Obtiene una versión de calidad media de una imagen de Wasi
 * Para uso en tarjetas y listas
 */
export function getMediumQualityWasiImage(imageUrl: string): string {
  return improveWasiImageQuality(imageUrl, 800, 600);
}

/**
 * Obtiene una versión de baja calidad (thumbnail) de una imagen de Wasi
 * Para uso en miniaturas
 */
export function getThumbnailWasiImage(imageUrl: string): string {
  return improveWasiImageQuality(imageUrl, 200, 150);
}

