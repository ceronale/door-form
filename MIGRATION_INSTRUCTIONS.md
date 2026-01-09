# Instrucciones de Migración

## ⚠️ IMPORTANTE: Ejecutar Migración SQL

Para que las nuevas funcionalidades de scraping funcionen correctamente, necesitas ejecutar la migración SQL en tu base de datos de Supabase.

### Pasos:

1. **Abre Supabase Dashboard**
   - Ve a tu proyecto en https://supabase.com
   - Navega a "SQL Editor"

2. **Ejecuta el Script de Migración**
   - Copia y pega el contenido del archivo `supabase/migration_add_property_fields.sql`
   - Haz clic en "Run" para ejecutar el script

3. **Verifica que se ejecutó correctamente**
   - Deberías ver un mensaje de éxito
   - Las nuevas columnas se habrán agregado a la tabla `properties`

### Campos que se agregarán:

- `area_constructed` - Área construida (m²)
- `level` - Nivel/Piso
- `construction_year` - Año de construcción
- `property_status` - Estado (Usado, Nuevo, etc.)
- `country` - País
- `province` - Provincia
- `city` - Ciudad
- `zone` - Zona
- `business_type` - Tipo de negocio (Alquiler/Venta)
- `administration_fee` - Cuota de administración
- `internal_features` - Características internas (array)
- `external_features` - Características externas (array)

### Nota:

Si no ejecutas la migración, el scraper seguirá funcionando pero solo guardará los campos básicos. Los campos adicionales se ignorarán sin causar errores.

