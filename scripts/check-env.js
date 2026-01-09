// Script para verificar que las variables de entorno estén configuradas
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

console.log('Verificando variables de entorno...\n');
console.log('📝 Nota: Supabase ahora soporta nuevos API keys. Ver: https://github.com/orgs/supabase/discussions/29260\n');

// Variables requeridas
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const secretKey = process.env.SUPABASE_SECRET_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let allPresent = true;
let warnings = [];

// Verificar URL
if (url) {
  const masked = url.length > 20 
    ? `${url.substring(0, 15)}...${url.substring(url.length - 10)}`
    : '***';
  console.log(`✅ NEXT_PUBLIC_SUPABASE_URL: ${masked}`);
} else {
  console.log(`❌ NEXT_PUBLIC_SUPABASE_URL: NO CONFIGURADA`);
  allPresent = false;
}

// Verificar publishable key (nuevo) o anon key (legacy)
if (publishableKey) {
  const masked = publishableKey.length > 20 
    ? `${publishableKey.substring(0, 15)}...${publishableKey.substring(publishableKey.length - 5)}`
    : '***';
  console.log(`✅ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${masked} (nuevo)`);
} else if (anonKey) {
  const masked = anonKey.length > 20 
    ? `${anonKey.substring(0, 15)}...${anonKey.substring(anonKey.length - 5)}`
    : '***';
  console.log(`✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: ${masked} (legacy)`);
  warnings.push('⚠️  Estás usando el anon key legacy. Considera migrar a publishable key.');
} else {
  console.log(`❌ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY: NO CONFIGURADA`);
  allPresent = false;
}

// Verificar secret key (nuevo) o service_role key (legacy)
if (secretKey) {
  const masked = secretKey.length > 20 
    ? `${secretKey.substring(0, 15)}...${secretKey.substring(secretKey.length - 5)}`
    : '***';
  console.log(`✅ SUPABASE_SECRET_KEY: ${masked} (nuevo)`);
} else if (serviceRoleKey) {
  const masked = serviceRoleKey.length > 20 
    ? `${serviceRoleKey.substring(0, 15)}...${serviceRoleKey.substring(serviceRoleKey.length - 5)}`
    : '***';
  console.log(`✅ SUPABASE_SERVICE_ROLE_KEY: ${masked} (legacy)`);
  warnings.push('⚠️  Estás usando el service_role key legacy. Considera migrar a secret key.');
} else {
  console.log(`❌ SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY: NO CONFIGURADA`);
  allPresent = false;
}

console.log('\n');

if (warnings.length > 0) {
  warnings.forEach(warning => console.log(warning));
  console.log('');
}

if (allPresent) {
  console.log('✅ Todas las variables de entorno están configuradas correctamente!');
  if (warnings.length > 0) {
    console.log('\n💡 Tip: Los nuevos API keys de Supabase ofrecen mejor seguridad y gestión.');
    console.log('   Más información: https://github.com/orgs/supabase/discussions/29260');
  }
  process.exit(0);
} else {
  console.log('❌ Faltan algunas variables de entorno. Por favor, verifica tu archivo .env');
  console.log('\n📚 Opciones de configuración:');
  console.log('   Opción 1 (Nuevos keys - Recomendado):');
  console.log('     - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...');
  console.log('     - SUPABASE_SECRET_KEY=sb_secret_...');
  console.log('   Opción 2 (Legacy keys):');
  console.log('     - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...');
  console.log('     - SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...');
  process.exit(1);
}

