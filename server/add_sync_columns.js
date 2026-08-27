require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function run() {
  try {
    console.log('🔄 Iniciando migración de base de datos para Merch ALV...');

    // 1. Ampliar columna pais en reglas_envio a TEXT
    console.log('1. Ampliando columna "pais" en "reglas_envio" a TEXT...');
    await pool.query(`ALTER TABLE reglas_envio ALTER COLUMN pais TYPE TEXT;`);

    // 2. Agregar columna orden a tiendas y products para drag and drop
    console.log('2. Agregando columna "orden" a "tiendas"...');
    await pool.query(`ALTER TABLE tiendas ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0;`);
    console.log('   Agregando columna "orden" a "products"...');
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 0;`);

    // 3. Agregar columna motivo_fallo a pedidos
    console.log('3. Agregando columna "motivo_fallo" a "pedidos"...');
    await pool.query(`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS motivo_fallo TEXT;`);

    // 4. Agregar columna hs_code a products
    console.log('4. Agregando columna "hs_code" a "products"...');
    await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS hs_code VARCHAR(50);`);

    console.log('✅ Migración de base de datos completada exitosamente.');
  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
  } finally {
    await pool.end();
  }
}

run();
