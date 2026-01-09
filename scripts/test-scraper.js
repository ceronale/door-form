// Script de prueba del scraper
// Ejecutar con: npx tsx scripts/test-scraper.ts

import { scrapeWasiProperty } from '../lib/scraper/wasi-scraper';

async function testScraper() {
  const testUrl = 'https://info.wasi.co/apartamento-alquiler-tzas-del-avila-caracas-sucre/9699004';
  
  console.log('🔍 Probando scraper con URL:', testUrl);
  console.log('⏳ Extrayendo información...\n');
  
  try {
    const result = await scrapeWasiProperty(testUrl);
    
    console.log('✅ Scraping completado!\n');
    console.log('📋 Resultados:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Título:', result.title);
    console.log('Precio:', result.price);
    console.log('Tipo:', result.propertyType);
    console.log('Habitaciones:', result.bedrooms);
    console.log('Baños:', result.bathrooms);
    console.log('Estacionamiento:', result.parking);
    console.log('Ubicación:', result.location);
    console.log('Dirección:', result.address || 'N/A');
    console.log('\n📝 Descripción:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    if (result.description) {
      const descLines = result.description.split('\n');
      descLines.forEach((line, i) => {
        console.log(`${i + 1}. ${line}`);
      });
    } else {
      console.log('(No se encontró descripción)');
    }
    console.log('\n🖼️  Imágenes encontradas:', result.images.length);
    result.images.slice(0, 3).forEach((img, i) => {
      console.log(`   ${i + 1}. ${img.substring(0, 80)}...`);
    });
    
    console.log('\n📊 Campos adicionales:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Área construida:', result.areaConstructed || 'N/A');
    console.log('Nivel:', result.level || 'N/A');
    console.log('Año construcción:', result.constructionYear || 'N/A');
    console.log('Estado:', result.propertyStatus || 'N/A');
    console.log('País:', result.country || 'N/A');
    console.log('Provincia:', result.province || 'N/A');
    console.log('Ciudad:', result.city || 'N/A');
    console.log('Zona:', result.zone || 'N/A');
    console.log('Tipo negocio:', result.businessType || 'N/A');
    console.log('Administración:', result.administrationFee || 'N/A');
    console.log('Características internas:', result.internalFeatures?.length || 0);
    if (result.internalFeatures && result.internalFeatures.length > 0) {
      result.internalFeatures.forEach(f => console.log(`   - ${f}`));
    }
    console.log('Características externas:', result.externalFeatures?.length || 0);
    if (result.externalFeatures && result.externalFeatures.length > 0) {
      result.externalFeatures.forEach(f => console.log(`   - ${f}`));
    }
    
    console.log('\n✅ Prueba completada exitosamente!');
  } catch (error) {
    console.error('❌ Error en el scraper:', error.message);
    console.error(error.stack);
  }
}

testScraper();

