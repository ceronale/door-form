/**
 * Script para crear el primer usuario administrador
 * Ejecuta: node scripts/create-admin-user.js
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan variables de entorno');
  console.error('Necesitas configurar:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SECRET_KEY o SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (query) => new Promise((resolve) => readline.question(query, resolve));

  try {
    console.log('📝 Crear Usuario Administrador\n');
    
    const email = await question('Email: ');
    const password = await question('Contraseña (mínimo 6 caracteres): ');

    if (password.length < 6) {
      console.error('❌ La contraseña debe tener al menos 6 caracteres');
      readline.close();
      process.exit(1);
    }

    console.log('\n⏳ Creando usuario...');

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Confirmar email automáticamente
    });

    if (error) {
      console.error('❌ Error al crear usuario:', error.message);
      readline.close();
      process.exit(1);
    }

    console.log('✅ Usuario creado exitosamente!');
    console.log(`   Email: ${data.user.email}`);
    console.log(`   ID: ${data.user.id}`);
    console.log('\n🎉 Ahora puedes iniciar sesión en /admin/login');

    readline.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    readline.close();
    process.exit(1);
  }
}

createAdminUser();

