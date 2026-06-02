require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const alterTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS shipping_rules (
        id         SERIAL PRIMARY KEY,
        paises     JSONB NOT NULL DEFAULT '[]',
        estados    JSONB NOT NULL DEFAULT '[]',
        precio     DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Table "shipping_rules" created successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error creating table:', err);
    process.exit(1);
  }
};

alterTable();
