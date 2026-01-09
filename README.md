# Sistema CRM Inmobiliario

Un sistema completo de gestión de clientes inmobiliarios desarrollado con Next.js 15, que incluye un formulario público para captar leads y un dashboard de administración para gestionar clientes, propiedades y seguimiento de contactos.

## 🚀 Características

### Formulario Público
- **UI Moderna y Minimalista**: Diseño limpio con mucho espacio en blanco y tipografía legible
- **Cards Seleccionables**: Interfaz visual para seleccionar tipos de propiedad con iconos
- **Contadores Intuitivos**: Botones de incremento/decremento y selección rápida para habitaciones, baños y estacionamientos
- **Formato de Moneda**: Inputs de presupuesto con formato automático
- **Validación en Tiempo Real**: Validación estricta con Zod y feedback inmediato
- **Diseño Responsive**: Optimizado para móviles primero

### Dashboard CRM
- **Gestión de Clientes**: Lista, búsqueda, filtros y vista detallada de clientes
- **Matching Automático**: Algoritmo inteligente que sugiere propiedades basado en requerimientos
- **Gestión de Propiedades**: CRUD completo con integración a Wasi
- **Seguimiento de Contactos**: Registro de llamadas, emails, visitas y próximos seguimientos
- **Estadísticas en Tiempo Real**: Dashboard con métricas clave
- **Autenticación Segura**: Sistema de login protegido

## 🛠️ Tech Stack

- **Next.js 15** (App Router)
- **Supabase** - Base de datos y autenticación
- **React Hook Form** - Manejo de estado del formulario
- **Zod** - Validación de esquemas
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos
- **TypeScript** - Tipado estático
- **date-fns** - Manejo de fechas

## 📦 Instalación

1. Instala las dependencias:

```bash
npm install
```

2. Configura Supabase:

   - Crea un proyecto en [Supabase](https://supabase.com)
   - Ejecuta el esquema SQL en el SQL Editor de Supabase (archivo `supabase/schema.sql`)
   - Obtén las credenciales de tu proyecto Supabase desde Settings > API

3. Configura las variables de entorno en `.env` o `.env.local`:

   **Opción 1: Nuevos API Keys (Recomendado)**
   
   Supabase introdujo nuevos tipos de API keys en 2025. Estos ofrecen mejor seguridad y gestión:
   
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

   **Opción 2: Legacy API Keys (Soportado)**
   
   Los keys legacy siguen funcionando pero eventualmente serán deprecados:
   
```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

   **Nota:** El código soporta ambos tipos de keys automáticamente. Puedes usar cualquiera de las dos opciones.
   
   Para más información sobre los cambios en Supabase API keys, consulta: [Supabase API Keys Discussion](https://github.com/orgs/supabase/discussions/29260)

4. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

6. Accede al dashboard de administración en [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

   - Crea un usuario desde el panel de Supabase (Authentication > Users > Add User)
   - O usa el método de registro si está habilitado

## 📋 Estructura del Sistema

### Formulario Público

### Campos Incluidos:

1. **Tipo de Propiedad** (Selección múltiple)
   - Casa
   - Apartamento
   - Townhouse
   - Terreno

2. **Especificaciones**
   - Habitaciones: 1, 2, 3, 4, 5+
   - Baños: 1, 1.5, 2, 2.5, 3, 3.5, 4+ (permite medios baños)
   - Puestos de Estacionamiento: 0, 1, 2, 3+

3. **Rango de Presupuesto**
   - Mínimo y Máximo (formato de moneda MXN)

4. **Ubicación/Zona de Interés**
   - Input de texto libre

5. **Preferencias Adicionales** (Opcional)
   - Cocina Remodelada
   - Jardín
   - Vigilancia
   - Piso Bajo
   - Vista Panorámica
   - Y más...

## 🎨 Componentes UI

El proyecto incluye componentes reutilizables:

- `Button` - Botones con variantes (default, outline, ghost)
- `Card` - Tarjetas seleccionables
- `Input` - Inputs con validación visual
- `Badge` - Chips/badges seleccionables

## 📝 Validaciones

- Tipo de propiedad: Al menos uno requerido
- Ubicación: Mínimo 3 caracteres
- Presupuesto: Máximo debe ser mayor o igual al mínimo
- Todos los campos numéricos tienen rangos válidos

## 🔧 Personalización

Puedes personalizar fácilmente:

- Colores en `tailwind.config.ts`
- Opciones de preferencias en `components/ClientRequirementsForm.tsx`
- Esquema de validación en el mismo archivo
- Estilos globales en `app/globals.css`

## 📱 Diseño Responsive

El formulario está optimizado para:
- Móviles (primera prioridad)
- Tablets
- Desktop

## 🎯 Funcionalidades del Dashboard

### Gestión de Clientes
- Ver lista de todos los clientes con filtros por estado
- Búsqueda por nombre, email o teléfono
- Vista detallada con requerimientos completos
- Actualización de estado y notas
- Historial de contactos y propiedades enviadas

### Matching Automático
- Algoritmo que compara requerimientos del cliente con propiedades disponibles
- Scoring basado en:
  - Tipo de propiedad (40 puntos)
  - Presupuesto (30 puntos)
  - Habitaciones (10 puntos)
  - Baños (10 puntos)
  - Estacionamiento (5 puntos)
  - Ubicación (5 puntos)
- Propiedades ordenadas por relevancia

### Gestión de Propiedades
- Agregar propiedades manualmente con link a Wasi
- Metadata básica: precio, ubicación, características
- Activar/desactivar propiedades
- Ver y editar detalles completos

### Seguimiento de Contactos
- Registrar diferentes tipos de contacto:
  - Llamadas
  - Emails
  - WhatsApp
  - Visitas
  - Reuniones
- Notas y comentarios
- Programar próximos seguimientos
- Historial completo de interacciones

## 🗄️ Estructura de Base de Datos

El sistema utiliza las siguientes tablas en Supabase:

- **clients**: Datos de clientes del formulario
- **properties**: Propiedades disponibles (con links a Wasi)
- **client_properties**: Historial de propiedades enviadas a clientes
- **contacts**: Seguimiento de contactos con clientes

Ver `supabase/schema.sql` para el esquema completo.

## 🚢 Build para Producción

```bash
npm run build
npm start
```

## 📝 Notas Importantes

- **API Keys de Supabase**: El sistema soporta tanto los nuevos API keys (`sb_publishable_...` y `sb_secret_...`) como los legacy (`anon` y `service_role`). Se recomienda usar los nuevos keys para mejor seguridad. Ver [documentación oficial](https://github.com/orgs/supabase/discussions/29260)
- Asegúrate de configurar correctamente las políticas RLS (Row Level Security) en Supabase
- El formulario público permite inserción sin autenticación, pero el dashboard requiere login
- Las propiedades se pueden vincular con Wasi mediante URLs
- El matching automático solo considera propiedades activas
- Puedes verificar tu configuración ejecutando: `npm run check-env`

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.



