-- Tabla de clientes (datos del formulario)
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  property_types TEXT[] NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL(3,1) NOT NULL,
  parking INTEGER NOT NULL,
  budget_min DECIMAL(12,2) NOT NULL,
  budget_max DECIMAL(12,2) NOT NULL,
  locations TEXT[] NOT NULL,
  preferences TEXT[],
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'interested', 'closed', 'lost')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de propiedades
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  wasi_url TEXT NOT NULL,
  property_type TEXT NOT NULL CHECK (property_type IN ('casa', 'apartamento', 'townhouse', 'terreno')),
  bedrooms INTEGER NOT NULL,
  bathrooms DECIMAL(3,1) NOT NULL,
  parking INTEGER NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  location TEXT NOT NULL,
  address TEXT,
  description TEXT,
  images TEXT[],
  is_active BOOLEAN DEFAULT true,
  -- Campos adicionales
  area_constructed DECIMAL(10,2),
  level INTEGER,
  construction_year INTEGER,
  property_status TEXT,
  country TEXT,
  province TEXT,
  city TEXT,
  zone TEXT,
  business_type TEXT,
  administration_fee DECIMAL(12,2),
  internal_features TEXT[],
  external_features TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación cliente-propiedad (propiedades enviadas)
CREATE TABLE IF NOT EXISTS client_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'viewed', 'interested', 'not_interested')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, property_id)
);

-- Tabla de contactos/seguimiento
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('call', 'email', 'whatsapp', 'visit', 'meeting', 'other')),
  notes TEXT NOT NULL,
  contact_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_follow_up TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_active ON properties(is_active);
CREATE INDEX IF NOT EXISTS idx_client_properties_client ON client_properties(client_id);
CREATE INDEX IF NOT EXISTS idx_client_properties_property ON client_properties(property_id);
CREATE INDEX IF NOT EXISTS idx_contacts_client ON contacts(client_id);
CREATE INDEX IF NOT EXISTS idx_contacts_date ON contacts(contact_date);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir todo para usuarios autenticados)
-- Nota: Ajusta estas políticas según tus necesidades de seguridad

-- Política para clients: solo usuarios autenticados pueden leer/escribir
CREATE POLICY "Users can read clients" ON clients
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert clients" ON clients
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update clients" ON clients
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete clients" ON clients
    FOR DELETE USING (auth.role() = 'authenticated');

-- Política para properties
CREATE POLICY "Users can read properties" ON properties
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert properties" ON properties
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update properties" ON properties
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete properties" ON properties
    FOR DELETE USING (auth.role() = 'authenticated');

-- Política para client_properties
CREATE POLICY "Users can read client_properties" ON client_properties
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert client_properties" ON client_properties
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update client_properties" ON client_properties
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete client_properties" ON client_properties
    FOR DELETE USING (auth.role() = 'authenticated');

-- Política para contacts
CREATE POLICY "Users can read contacts" ON contacts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert contacts" ON contacts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update contacts" ON contacts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete contacts" ON contacts
    FOR DELETE USING (auth.role() = 'authenticated');

-- Política especial: permitir inserción de clients desde API pública (sin autenticación)
-- Esto permite que el formulario público pueda guardar datos
CREATE POLICY "Public can insert clients" ON clients
    FOR INSERT WITH CHECK (true);



