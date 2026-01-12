# Análisis del Scraper - Sistema CRM Inmobiliario

## 📋 Resumen General

El scraper es un módulo que extrae información de propiedades inmobiliarias desde sitios web como **Wasi** (`info.wasi.co`, `wasi.co`) y **Remax** (`remaxhabitat.com`). Está implementado en TypeScript usando **Cheerio** para el parsing de HTML.

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **`lib/scraper/wasi-scraper.ts`** - Módulo principal del scraper
2. **`app/api/properties/scrape/route.ts`** - API endpoint que expone el scraper
3. **`components/admin/ScrapePropertyForm.tsx`** - Interfaz de usuario para usar el scraper
4. **`scripts/test-scraper.js`** - Script de prueba del scraper

---

## 🔄 Flujo de Funcionamiento

### 1. Entrada del Usuario
```
Usuario → ScrapePropertyForm → Ingresa URL → POST /api/properties/scrape
```

### 2. Validación de URL
El endpoint valida que la URL sea de un sitio soportado:
- `wasi.co`
- `info.wasi.co`
- `remaxhabitat.com`

### 3. Proceso de Scraping
La función `scrapeWasiProperty(url)` realiza los siguientes pasos:

#### Paso 1: Obtención del HTML
```typescript
const response = await fetch(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  },
});
const html = await response.text();
const $ = cheerio.load(html);
```

#### Paso 2: Extracción de Datos
El scraper extrae información usando múltiples estrategias:

---

## 📊 Datos Extraídos

### Información Básica

#### 1. **Título**
- Fuentes: `<meta property="og:title">`, `<title>`
- Limpieza: Remueve el precio del título si está presente

#### 2. **Precio**
- Patrones buscados:
  - `US$4,200`, `$4,200`, `4200 USD`
  - Números grandes (3+ dígitos)
- Selectores CSS: Elementos que contienen "Precio", "Alquiler", "US$"

#### 3. **Tipo de Propiedad**
- Normalización a: `'casa' | 'apartamento' | 'townhouse' | 'terreno'`
- Palabras clave detectadas:
  - Apartamento: `apartamento`, `apartment`
  - Casa: `casa`, `house`, `home`
  - Townhouse: `townhouse`, `town house`
  - Terreno: `terreno`, `lote`, `parcela`, `land`
  - Comercial: `galpón`, `local comercial`, `depósito` → mapeado a `terreno`

#### 4. **Características Numéricas**
- **Habitaciones**: Busca patrones como:
  - `"2 habitaciones"`, `"2 amplias habitaciones"`
  - Formato abreviado: `"1h/1b/1e"` (1 habitación, 1 baño, 1 estacionamiento)
- **Baños**: Busca patrones como:
  - `"1 baño"`, `"baño: 1"`
  - Soporta medios baños: `"2.5 baños"`
- **Estacionamiento**: Busca patrones como:
  - `"1 puesto de estacionamiento"`, `"1 estacionamiento"`

#### 5. **Ubicación**
Estrategias múltiples (en orden de prioridad):
1. **JSON-LD**: `<script type="application/ld+json">` → `address.addressLocality`
2. **Meta Tags**: `<meta name="Keywords">` → Extrae texto después de "en"
3. **URL**: Para `info.wasi.co`, extrae del formato:
   ```
   apartamento-alquiler-san-bernardino-caracas-libertador
   → Ubicación: "San Bernardino Caracas Libertador"
   ```
4. **Fallback**: "Caracas" si no se encuentra nada

#### 6. **Descripción**
Estrategia compleja con múltiples niveles:

**Estrategia 1: Meta Tags**
- `<meta property="og:description">`
- `<meta name="description">`

**Estrategia 2: Sección "Descripción Adicional"** (para info.wasi.co)
- Busca `<h3>` con texto "Descripción" o "descripción"
- Encuentra el contenedor padre `.col-md-12`
- Extrae divs con texto descriptivo
- Procesa líneas que empiezan con:
  - `"Se alquila/vende..."` (primera línea)
  - Números seguidos de unidades (ej: `"64mts2"`, `"2 amplias habitaciones"`)
  - Frases que empiezan con mayúscula

**Estrategia 3: Selectores CSS**
- `.description`, `.descripcion`
- `[class*="description"]`

**Estrategia 4: Párrafos largos**
- Busca `<p>` con más de 50 caracteres

#### 7. **Imágenes**
Extracción en múltiples niveles (prioridad):

1. **Swiper/Galería Principal**:
   - `.swiper-slide` → `href` o `<img src>`
   - Filtra solo URLs de `image.wasi.co` o `images.wasi.co`

2. **Meta Tags**:
   - `<meta property="og:image">` (mejor calidad)

3. **JSON-LD**:
   - `jsonLdData.image`

4. **Fotorama** (info.wasi.co):
   - `.fotorama__stage__frame` → `<img class="fotorama__img">`
   - Atributos: `src`, `data-src`, `data-full`, `href`
   - Data attributes: `data-images`, `data-gallery`

5. **Todas las imágenes**:
   - Busca todos los `<img>` con atributos: `src`, `data-src`, `data-lazy-src`, `data-original`
   - Filtra solo URLs de wasi.co
   - Límite: 20 imágenes máximo

#### 8. **Dirección**
- Selectores: `.address`, `.direccion`, `[class*="address"]`
- Requiere mínimo 10 caracteres

#### 9. **Campos Adicionales**
Extraídos del texto del body usando expresiones regulares:

- **Área Construida**: `"Área Construida: 64 m²"` o `"64mts2"`
- **Nivel**: `"Nivel: 2"` o `"Piso: 3"`
- **Año de Construcción**: `"Año de construcción: 2020"`
- **Estado**: `"Estado: Usado"`
- **País/Provincia/Ciudad/Zona**: `"País: Venezuela"`
- **Tipo de Negocio**: `"Negocio: Alquiler"` o del título
- **Administración**: `"Administración: US$50"`

#### 10. **Características Internas y Externas**
Busca secciones específicas en el HTML:

**Características Internas**:
- Busca sección con texto "Características internas"
- Palabras clave: `Agua`, `Aire acondicionado`, `Armarios Empotrados`, `Clósets`, `Cocina equipada`, etc.

**Características Externas**:
- Busca sección con texto "Características externas"
- Palabras clave: `Ascensor`, `Centros comerciales`, `Jardín`, `Vigilancia`, etc.

---

## 🛠️ Funciones Auxiliares

### `normalizePropertyType(text: string)`
Normaliza el texto del tipo de propiedad a uno de los 4 tipos permitidos.

### `extractPrice(text: string): number`
Extrae el precio usando regex:
- `/(?:US\$|USD|\$)\s*([\d,]+)/i`
- Si no encuentra, busca números grandes (3+ dígitos)

### `extractNumber(text: string, keywords: string[]): number`
Busca números asociados a palabras clave:
- Antes: `"2 habitaciones"`
- Después: `"habitaciones: 2"`

### `extractFromAbbreviatedFormat(text: string)`
Extrae del formato abreviado:
- `"1h/1b/1e"` → `{ bedrooms: 1, bathrooms: 1, parking: 1 }`
- `"2hab/2.5baño/1est"` → `{ bedrooms: 2, bathrooms: 2.5, parking: 1 }`

---

## 💾 Guardado en Base de Datos

Después del scraping, el endpoint:

1. **Verifica duplicados**: Busca si ya existe una propiedad con la misma `wasi_url`
2. **Construye objeto de inserción**: Mapea los datos del scraper a la estructura de la BD
3. **Inserta en Supabase**: Tabla `properties` con todos los campos extraídos

### Mapeo de Campos

```typescript
ScrapedProperty → Database
- title → title
- wasiUrl → wasi_url
- propertyType → property_type
- bedrooms → bedrooms
- bathrooms → bathrooms
- parking → parking
- price → price
- location → location
- address → address
- description → description
- images → images (array JSON)
- areaConstructed → area_constructed
- level → level
- constructionYear → construction_year
- propertyStatus → property_status
- country → country
- province → province
- city → city
- zone → zone
- businessType → business_type
- administrationFee → administration_fee
- internalFeatures → internal_features (array JSON)
- externalFeatures → external_features (array JSON)
```

---

## 🧪 Testing

El script `scripts/test-scraper.js` permite probar el scraper directamente:

```bash
npx tsx scripts/test-scraper.js
```

Prueba con una URL de ejemplo y muestra todos los datos extraídos.

---

## ⚠️ Manejo de Errores

1. **Error de red**: Si `fetch()` falla, lanza error con mensaje descriptivo
2. **HTML inválido**: Cheerio maneja HTML malformado automáticamente
3. **Datos faltantes**: Usa valores por defecto (ej: `location = 'Caracas'`, `bedrooms = 0`)
4. **URL inválida**: Validación en el endpoint antes de hacer scraping
5. **Propiedad duplicada**: Retorna error 409 con el ID de la propiedad existente

---

## 🔍 Estrategias de Extracción

### Principio de Múltiples Fuentes
El scraper usa **múltiples estrategias** para cada dato, en orden de prioridad:
1. Meta tags (más confiables)
2. JSON-LD (estructurado)
3. Selectores CSS específicos
4. Parsing de texto con regex
5. Fallbacks con valores por defecto

### Robustez
- Maneja diferentes formatos de URL (info.wasi.co vs wasi.co)
- Soporta variaciones en el HTML (diferentes estructuras)
- Filtra contenido no deseado (botones, formularios, etc.)
- Limita tamaños (descripción: 1000 chars, imágenes: 20 máximo)

---

## 📈 Limitaciones y Consideraciones

### Limitaciones Actuales
1. **Solo sitios específicos**: Wasi y Remax
2. **Dependiente de estructura HTML**: Si cambia el HTML del sitio, puede fallar
3. **Sin autenticación**: No maneja sitios que requieren login
4. **Sin JavaScript**: Solo parsea HTML estático (no ejecuta JS)

### Mejoras Potenciales
1. Soporte para más sitios inmobiliarios
2. Cache de resultados para evitar re-scraping
3. Rate limiting para evitar bloqueos
4. Manejo de imágenes lazy-loaded con JavaScript
5. Validación más robusta de datos extraídos

---

## 🎯 Casos de Uso

1. **Agregar propiedad manualmente**: Admin ingresa URL → Scraper extrae datos → Guarda en BD
2. **Automatización**: Potencial para scraping masivo (no implementado actualmente)
3. **Sincronización**: Mantener propiedades actualizadas desde fuentes externas

---

## 📝 Notas Técnicas

- **Cheerio**: Librería similar a jQuery para Node.js, permite manipular HTML como DOM
- **User-Agent**: Se usa un User-Agent de navegador para evitar bloqueos
- **TypeScript**: Todo el código está tipado para mayor seguridad
- **Next.js API Routes**: El endpoint está en `/api/properties/scrape` usando App Router

---

## 🔐 Seguridad

- **Autenticación requerida**: El endpoint requiere `requireAuth()` antes de ejecutar
- **Validación de URL**: Solo acepta URLs de sitios permitidos
- **Sanitización**: Los datos extraídos se validan antes de guardar
- **Rate limiting**: Podría agregarse para prevenir abuso

---

## 📚 Referencias

- Archivo principal: `lib/scraper/wasi-scraper.ts` (1007 líneas)
- Endpoint API: `app/api/properties/scrape/route.ts`
- Interfaz: `components/admin/ScrapePropertyForm.tsx`
- Script de prueba: `scripts/test-scraper.js`
