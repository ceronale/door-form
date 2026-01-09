# Ejemplo de archivo .env

Basado en la nueva estructura de API keys de Supabase, tu archivo `.env` debería verse así:

## Opción 1: Nuevos API Keys (Recomendado - como se ve en tu dashboard)

```env
# URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# Publishable Key (seguro para usar en el navegador)
# Lo encuentras en: Settings > API > Publishable key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_wZewhlh53-hPsEc2f0KJvA_UUPLk...

# Secret Key (solo para servidor, nunca exponer públicamente)
# Lo encuentras en: Settings > API > Secret keys
SUPABASE_SECRET_KEY=sb_secret_COEj0e0y0ukEJ3RZnIDQ7A_7d_r1xA9
```

## Opción 2: Legacy API Keys (Soportado pero eventualmente deprecado)

Si prefieres usar los keys legacy que ya tienes:

```env
# URL del proyecto Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co

# Anon Key (legacy)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (legacy)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Notas Importantes:

1. **Nunca subas el archivo `.env` a Git** - Ya está en `.gitignore`
2. **El Secret Key es privado** - Solo úsalo en el servidor, nunca en el cliente
3. **El Publishable Key es público** - Seguro para usar en el navegador si tienes RLS configurado
4. El código soporta automáticamente ambos tipos de keys

## Cómo obtener tus keys:

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Settings → API
3. Copia el **Publishable key** (formato `sb_publishable_...`)
4. Copia el **Secret key** (formato `sb_secret_...`) - haz clic en el ícono del ojo para verlo completo



