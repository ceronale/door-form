/**
 * Copia texto al portapapeles
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    // Fallback para navegadores antiguos
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      console.error('Fallback copy failed:', fallbackError);
      return false;
    }
  }
}

/**
 * Descarga una imagen desde una URL
 */
export async function downloadImage(imageUrl: string, filename: string): Promise<void> {
  try {
    // Obtener la imagen
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    // Crear URL temporal
    const url = window.URL.createObjectURL(blob);
    
    // Crear elemento <a> para descargar
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading image:', error);
    // Fallback: abrir en nueva pestaña
    window.open(imageUrl, '_blank');
  }
}

/**
 * Descarga múltiples imágenes
 */
export async function downloadMultipleImages(
  imageUrls: string[],
  baseFilename: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  for (let i = 0; i < imageUrls.length; i++) {
    const url = imageUrls[i];
    const extension = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[1] || 'jpg';
    const filename = `${baseFilename}_${i + 1}.${extension}`;
    
    await downloadImage(url, filename);
    
    if (onProgress) {
      onProgress(i + 1, imageUrls.length);
    }
    
    // Pequeña pausa entre descargas para evitar sobrecarga
    if (i < imageUrls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
}

/**
 * Descarga múltiples imágenes en un archivo ZIP
 */
export async function downloadImagesAsZip(
  imageUrls: string[],
  baseFilename: string,
  onProgress?: (current: number, total: number) => void,
  improveQuality?: (url: string) => string
): Promise<void> {
  // Importar JSZip dinámicamente (solo en el cliente)
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  try {
    // Descargar todas las imágenes y agregarlas al ZIP
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      
      try {
        // Mejorar calidad si se proporciona la función
        const imageUrl = improveQuality ? improveQuality(url) : url;
        
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const extension = url.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[1] || 'jpg';
        const filename = `${baseFilename}_${i + 1}.${extension}`;
        
        // Agregar imagen al ZIP
        zip.file(filename, blob);
        
        if (onProgress) {
          onProgress(i + 1, imageUrls.length);
        }
      } catch (error) {
        console.error(`Error downloading image ${i + 1}:`, error);
        // Continuar con las demás imágenes
      }
    }

    // Generar el archivo ZIP
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Descargar el ZIP
    const url = window.URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${baseFilename}.zip`;
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating ZIP:', error);
    throw error;
  }
}

