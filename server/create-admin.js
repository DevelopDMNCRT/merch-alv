// Run: node create-admin.js <username> <email> <password>
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const [,, username, email, password] = process.argv;

if (!username || !email || !password) {
  console.error('Usage: node create-admin.js <username> <email> <password>');
  process.exit(1);
}

(async () => {
  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    'INSERT INTO admins (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
    [username, email, hash]
  );
  console.log('Admin creado:', rows[0]);
  process.exit(0);
})().catch(err => {
  console.error(err.message);
  process.exit(1);
});
