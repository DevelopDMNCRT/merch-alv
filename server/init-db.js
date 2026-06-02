require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const createTables = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      correo VARCHAR(100) UNIQUE NOT NULL,
      rol VARCHAR(50) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS news (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id               SERIAL PRIMARY KEY,
      nombre           VARCHAR(255) NOT NULL,
      slug             VARCHAR(255) UNIQUE,
      descripcion      TEXT,
      precio           DECIMAL(10, 2),
      stock            INTEGER DEFAULT 0,
      envio_especial   DECIMAL(10, 2),
      peso             DECIMAL(10, 2),
      es_variable      BOOLEAN DEFAULT FALSE,
      es_publico       BOOLEAN DEFAULT TRUE,
      imagen_url       TEXT,
      galeria_urls     JSONB DEFAULT '[]',
      atributos        JSONB,
      preventa_inicio  TIMESTAMPTZ,
      preventa_fin     TIMESTAMPTZ,
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS product_variations (
      id         SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      valor      VARCHAR(255) NOT NULL,
      precio     DECIMAL(10, 2),
      stock      INTEGER DEFAULT 0,
      color      VARCHAR(20),
      imagen_url TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS admins (
      id         SERIAL PRIMARY KEY,
      username   VARCHAR(100) UNIQUE NOT NULL,
      email      VARCHAR(100) UNIQUE NOT NULL,
      password   VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS shipping_rules (
      id         SERIAL PRIMARY KEY,
      paises     JSONB NOT NULL DEFAULT '[]',
      estados    JSONB NOT NULL DEFAULT '[]',
      precio     DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(queryText);
    console.log('Tables created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating tables:', err);
    process.exit(1);
  }
};

createTables();
