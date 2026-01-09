-- Migración: Agregar campos adicionales a la tabla properties
-- Ejecutar este script en Supabase SQL Editor si ya tienes datos

-- Agregar nuevas columnas (si no existen)
DO $$ 
BEGIN
    -- Área construida
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'area_constructed') THEN
        ALTER TABLE properties ADD COLUMN area_constructed DECIMAL(10,2);
    END IF;

    -- Nivel
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'level') THEN
        ALTER TABLE properties ADD COLUMN level INTEGER;
    END IF;

    -- Año de construcción
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'construction_year') THEN
        ALTER TABLE properties ADD COLUMN construction_year INTEGER;
    END IF;

    -- Estado de la propiedad
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'property_status') THEN
        ALTER TABLE properties ADD COLUMN property_status TEXT;
    END IF;

    -- País
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'country') THEN
        ALTER TABLE properties ADD COLUMN country TEXT;
    END IF;

    -- Provincia
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'province') THEN
        ALTER TABLE properties ADD COLUMN province TEXT;
    END IF;

    -- Ciudad
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'city') THEN
        ALTER TABLE properties ADD COLUMN city TEXT;
    END IF;

    -- Zona
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'zone') THEN
        ALTER TABLE properties ADD COLUMN zone TEXT;
    END IF;

    -- Tipo de negocio (Alquiler/Venta)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'business_type') THEN
        ALTER TABLE properties ADD COLUMN business_type TEXT;
    END IF;

    -- Cuota de administración
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'administration_fee') THEN
        ALTER TABLE properties ADD COLUMN administration_fee DECIMAL(12,2);
    END IF;

    -- Características internas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'internal_features') THEN
        ALTER TABLE properties ADD COLUMN internal_features TEXT[];
    END IF;

    -- Características externas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'properties' AND column_name = 'external_features') THEN
        ALTER TABLE properties ADD COLUMN external_features TEXT[];
    END IF;
END $$;

