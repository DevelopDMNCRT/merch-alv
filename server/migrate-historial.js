require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const migrate = async () => {
  try {
    console.log('Creando tabla pedido_historial...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedido_historial (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
        estado VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Tabla creada correctamente.');

    console.log('Realizando backfill para pedidos existentes...');
    // Para todos los pedidos que no tengan ya un historial con su estado actual (o inicial)
    // insertaremos un registro. En este caso, para no ser redundantes, insertaremos un estado "Nuevo"
    // con la fecha de creacion, y si el estado actual no es "Nuevo", insertaremos también el estado actual
    // con una fecha ligeramente posterior.
    
    const { rows: pedidos } = await pool.query('SELECT id, estado, created_at FROM pedidos');
    
    let count = 0;
    for (const pedido of pedidos) {
      // Check if history already exists
      const { rows: history } = await pool.query('SELECT id FROM pedido_historial WHERE pedido_id = $1', [pedido.id]);
      
      if (history.length === 0) {
        // Insert initial "Nuevo" state with the exact created_at
        await pool.query(
          'INSERT INTO pedido_historial (pedido_id, estado, created_at) VALUES ($1, $2, $3)',
          [pedido.id, 'Nuevo', pedido.created_at]
        );
        
        // Si el estado no es "Nuevo", insertamos el estado actual
        if (pedido.estado && pedido.estado !== 'Nuevo') {
          // As a mock date for the transition, we add a day or just use current timestamp.
          // Since it's a backfill, we can use current timestamp.
          await pool.query(
            'INSERT INTO pedido_historial (pedido_id, estado) VALUES ($1, $2)',
            [pedido.id, pedido.estado]
          );
        }
        count++;
      }
    }

    console.log(`Backfill completado: ${count} pedidos migrados.`);
    process.exit(0);
  } catch (error) {
    console.error('Error en migración:', error);
    process.exit(1);
  }
};

migrate();
