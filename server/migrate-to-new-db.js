const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_Pn3GYoUSIl5A@ep-nameless-art-aqn16jq6-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false },
});

const createMissingTables = async () => {
  const sql = `
    -- ─── tiendas ────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS tiendas (
      id         SERIAL PRIMARY KEY,
      nombre     VARCHAR(255) NOT NULL,
      publico    BOOLEAN DEFAULT TRUE,
      imagen_url TEXT,
      header_url TEXT,
      deleted_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ─── pedidos ─────────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS pedidos (
      id          SERIAL PRIMARY KEY,
      orden       VARCHAR(50) UNIQUE NOT NULL,
      nombre      VARCHAR(255) NOT NULL,
      correo      VARCHAR(255),
      telefono    VARCHAR(50),
      pais        VARCHAR(100),
      estado_env  VARCHAR(100),
      ciudad      VARCHAR(100),
      calle       VARCHAR(255),
      num_ext     VARCHAR(50),
      num_int     VARCHAR(50),
      colonia     VARCHAR(100),
      cp          VARCHAR(20),
      domicilio   TEXT,
      notas       TEXT,
      items       JSONB DEFAULT '[]',
      subtotal    DECIMAL(10,2) DEFAULT 0,
      envio       DECIMAL(10,2) DEFAULT 0,
      total       DECIMAL(10,2) DEFAULT 0,
      estado      VARCHAR(50) DEFAULT 'Nuevo',
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ─── suscriptores ────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS suscriptores (
      id         VARCHAR(20) PRIMARY KEY,
      nombre     VARCHAR(255) NOT NULL,
      correo     VARCHAR(255) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- ─── boletines ───────────────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS boletines (
      id         SERIAL PRIMARY KEY,
      asunto     VARCHAR(255) NOT NULL DEFAULT '',
      html       TEXT NOT NULL DEFAULT '',
      estado     VARCHAR(50) NOT NULL DEFAULT 'Borrador',
      sent_at    TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    console.log('Conectando a la base de datos...');
    await pool.query(sql);
    console.log('✅ Tablas faltantes creadas exitosamente.');
    console.log('\nTablas creadas:');
    console.log('  - tiendas');
    console.log('  - pedidos');
    console.log('  - suscriptores');
    console.log('  - boletines');

    // También asegurar que products tenga la columna deleted_at y tienda
    const alterSQL = `
      ALTER TABLE products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
      ALTER TABLE products ADD COLUMN IF NOT EXISTS tienda VARCHAR(255) DEFAULT 'General';
      ALTER TABLE products ADD COLUMN IF NOT EXISTS flag VARCHAR(100);
    `;
    await pool.query(alterSQL);
    console.log('\n✅ Columnas extra verificadas en products (deleted_at, tienda, flag).');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

createMissingTables();
