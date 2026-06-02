require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const seedUser = async () => {
  const nombre = 'Ricardo';
  const correo = 'demiancrate@gmail.com';
  const password = 'PamMartin1!';
  const rol = 'Administrador';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user already exists
    const check = await pool.query('SELECT id FROM users WHERE correo = $1', [correo]);
    if (check.rows.length > 0) {
      console.log('User already exists');
      process.exit(0);
    }

    await pool.query(
      'INSERT INTO users (nombre, correo, rol, password) VALUES ($1, $2, $3, $4)',
      [nombre, correo, rol, hashedPassword]
    );
    
    console.log(`User ${nombre} created successfully`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding user:', err);
    process.exit(1);
  }
};

seedUser();
