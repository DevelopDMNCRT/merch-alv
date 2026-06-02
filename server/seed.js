require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const stores = [
  { nombre: "Tienda 1", imagen_url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=600&q=80" },
  { nombre: "Tienda 2", imagen_url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=600&q=80" },
  { nombre: "Tienda 3", imagen_url: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=600&q=80" },
  { nombre: "Tienda 4", imagen_url: "https://images.unsplash.com/photo-1539625319138-023796773d64?auto=format&fit=crop&w=600&q=80" },
  { nombre: "Tienda 5", imagen_url: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=600&q=80" },
  { nombre: "Tienda 6", imagen_url: "https://images.unsplash.com/photo-1484755560693-a4074577af3a?auto=format&fit=crop&w=600&q=80" },
  { nombre: "Tienda 7", imagen_url: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=600&q=80" },
  { nombre: "Tienda 8", imagen_url: "https://images.unsplash.com/photo-1513829096963-478a5908a17d?auto=format&fit=crop&w=600&q=80" },
  { nombre: "Tienda 9", imagen_url: "https://images.unsplash.com/photo-1598387993441-a364f854c3e1?auto=format&fit=crop&w=600&q=80" },
  { nombre: "Tienda 10", imagen_url: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=600&q=80" },
  { nombre: "Tienda 11", imagen_url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=600&q=80" },
  { nombre: "Tienda 12", imagen_url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80" }
];

const productPrefixes = ["Playera", "Sudadera", "Gorra", "Taza", "Póster", "Pin", "Mochila", "Sticker", "Llavero", "Calcetines"];
const adjectives = ["Clásica", "Vintage", "Neon", "Minimalista", "Edición Limitada", "Premium", "Básica", "Tour 2024", "Retro", "Oficial"];
const flags = ["", "Nuevo", "Popular", "Preventa", "Agotado"];
const productImages = ["/images/product1.png", "/images/product2.png", "/images/product3.png"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateSlug(name) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000);
}

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log("Limpiando base de datos...");
    await client.query('TRUNCATE TABLE product_variations, products, tiendas RESTART IDENTITY CASCADE');

    console.log("Creando tiendas...");
    for (const store of stores) {
      await client.query(
        'INSERT INTO tiendas (nombre, publico, imagen_url) VALUES ($1, $2, $3)',
        [store.nombre, true, store.imagen_url]
      );
    }

    console.log("Creando productos...");
    for (const store of stores) {
      const storeName = store.nombre;
      for (let i = 0; i < 5; i++) {
        const productName = `${getRandomItem(productPrefixes)} ${getRandomItem(adjectives)}`;
        const price = Math.floor(Math.random() * 500) + 100;
        const stock = Math.floor(Math.random() * 100);
        const flag = getRandomItem(flags);
        const slug = generateSlug(productName);
        const esVariable = Math.random() > 0.7; // 30% chance of being variable
        const imagenUrl = getRandomItem(productImages);
        
        let attrJson = null;
        if (esVariable) {
          attrJson = JSON.stringify([{ nombre: 'Talla', opciones: 'S, M, L' }]);
        }

        const res = await client.query(
          `INSERT INTO products (nombre, descripcion, precio, stock, es_variable, es_publico, slug, tienda, flag, atributos, imagen_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
          [productName, `Descripción para ${productName}`, esVariable ? null : price, esVariable ? 0 : stock, esVariable, true, slug, storeName, flag || null, attrJson, imagenUrl]
        );

        if (esVariable) {
          const productId = res.rows[0].id;
          const tallas = ['S', 'M', 'L'];
          for (const talla of tallas) {
             await client.query(
               'INSERT INTO product_variations (product_id, valor, precio, stock, imagen_url) VALUES ($1, $2, $3, $4, $5)',
               [productId, talla, price, Math.floor(Math.random() * 50), imagenUrl]
             );
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log("¡Seed completado exitosamente!");
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error al sembrar:", err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
