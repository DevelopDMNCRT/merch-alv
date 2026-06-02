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
    await pool.query('ALTER TABLE products ADD COLUMN peso DECIMAL(10, 2);');
    console.log('Column "peso" added successfully');
    process.exit(0);
  } catch (err) {
    if (err.code === '42701') {
      console.log('Column "peso" already exists.');
      process.exit(0);
    } else {
      console.error('Error adding column:', err);
      process.exit(1);
    }
  }
};

alterTable();
