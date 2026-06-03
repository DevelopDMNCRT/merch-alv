// dotenv loaded via dotenvx CLI before node startup
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { upload, uploadTienda, uploadNews } = require('./cloudinary');
const multer = require('multer');
const nodemailer = require('nodemailer');

// ── Email transporter ──────────────────────────────────────────────────────
const mailer = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

// Estados que disparan correo al cliente y la plantilla correspondiente
const EMAIL_TRIGGERS = {
  'En proceso': (p) => ({
    subject: `Tu pedido #${p.orden} está en proceso — Amigo Merch`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#237650">¡Tu pedido está en preparación! 📦</h2>
        <p>Hola <strong>${p.nombre}</strong>,</p>
        <p>Tu pedido <strong>#${p.orden}</strong> ya está siendo preparado por nuestro equipo. Pronto lo enviaremos a tu domicilio.</p>
        <p style="color:#666">Puedes rastrear tu pedido en <a href="https://amigo-merch.vercel.app/rastreo" style="color:#237650">amigo-merch.vercel.app/rastreo</a> usando el número <strong>#${p.orden}</strong>.</p>
        <p>¡Gracias por tu compra!</p>
        <p style="color:#aaa;font-size:12px">Amigo Merch — hola@amigomerch.mx</p>
      </div>
    `
  }),
  'Completado': (p) => ({
    subject: `Tu pedido #${p.orden} fue entregado — Amigo Merch`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#237650">¡Tu pedido fue entregado! ✅</h2>
        <p>Hola <strong>${p.nombre}</strong>,</p>
        <p>Tu pedido <strong>#${p.orden}</strong> ha sido marcado como entregado. Esperamos que estés disfrutando tu merch.</p>
        <p>Si tienes algún problema con tu pedido, contáctanos en <a href="mailto:hola@amigomerch.mx" style="color:#237650">hola@amigomerch.mx</a>.</p>
        <p>¡Gracias por confiar en Amigo Merch! 🎉</p>
        <p style="color:#aaa;font-size:12px">Amigo Merch — hola@amigomerch.mx</p>
      </div>
    `
  }),
  'Cancelado': (p) => ({
    subject: `Tu pedido #${p.orden} fue cancelado — Amigo Merch`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#c62828">Pedido cancelado</h2>
        <p>Hola <strong>${p.nombre}</strong>,</p>
        <p>Lamentamos informarte que tu pedido <strong>#${p.orden}</strong> ha sido cancelado.</p>
        <p>Si tienes preguntas o crees que esto es un error, contáctanos en <a href="mailto:hola@amigomerch.mx" style="color:#237650">hola@amigomerch.mx</a>.</p>
        <p style="color:#aaa;font-size:12px">Amigo Merch — hola@amigomerch.mx</p>
      </div>
    `
  }),
  'Fallido': (p) => ({
    subject: `Problema con tu pedido #${p.orden} — Amigo Merch`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
        <h2 style="color:#c62828">Problema con tu pedido</h2>
        <p>Hola <strong>${p.nombre}</strong>,</p>
        <p>Tuvimos un problema al procesar tu pedido <strong>#${p.orden}</strong>. El pago no pudo ser completado.</p>
        <p>Te invitamos a intentar nuevamente o contáctanos para ayudarte: <a href="mailto:hola@amigomerch.mx" style="color:#237650">hola@amigomerch.mx</a>.</p>
        <p style="color:#aaa;font-size:12px">Amigo Merch — hola@amigomerch.mx</p>
      </div>
    `
  }),
};

async function sendStatusEmail(pedido, estado) {
  const trigger = EMAIL_TRIGGERS[estado];
  if (!trigger) return; // Estado sin correo (ej: Nuevo)
  if (!process.env.SMTP_USER) {
    console.warn(`[EMAIL SKIPPED] No SMTP_USER configured`);
    return;
  }
  const { subject, html } = trigger(pedido);
  try {
    await mailer.sendMail({
      from: `"Amigo Merch" <develop@dmncrt.com>`,
      to:   pedido.correo,
      subject,
      html,
    });
    console.log(`[EMAIL SENT] "${estado}" → ${pedido.correo}`);
  } catch (err) {
    console.error(`[EMAIL ERROR]`, err.message);
  }
}

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// --- PayPal Configuration & Helpers ---
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';
const PAYPAL_API = PAYPAL_MODE === 'production' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
    throw new Error('PayPal credentials are not configured in environment variables');
  }
  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to get PayPal token: ${text}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function createPayPalOrder(amountVal) {
  const token = await getPayPalAccessToken();
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'MXN',
          value: amountVal.toFixed(2)
        }
      }]
    })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create PayPal order: ${text}`);
  }
  return await res.json();
}

async function capturePayPalOrder(orderId) {
  const token = await getPayPalAccessToken();
  const res = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to capture PayPal order: ${text}`);
  }
  return await res.json();
}

// --- PayPal Endpoints ---

// GET client ID securely
app.get('/api/config/paypal', (req, res) => {
  res.json({ clientId: PAYPAL_CLIENT_ID });
});

// Create Order in PayPal API
app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const { total } = req.body;
    if (!total || isNaN(parseFloat(total))) {
      return res.status(400).json({ error: 'Monto total inválido' });
    }
    const order = await createPayPalOrder(parseFloat(total));
    res.json(order);
  } catch (err) {
    console.error('PayPal Order Creation Error:', err.message);
    res.status(500).json({ error: 'No se pudo crear la orden con PayPal', details: err.message });
  }
});

// Capture Payment and Save local order
app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderID, form, items, subtotal, envio, total } = req.body;
    if (!orderID) {
      return res.status(400).json({ error: 'orderID es requerido' });
    }
    if (!form || !items || !total) {
      return res.status(400).json({ error: 'Datos de pedido incompletos' });
    }

    // 1. Capturar el pago de la orden en PayPal
    const captureData = await capturePayPalOrder(orderID);
    
    // Verificar si la captura fue exitosa (status COMPLETED)
    if (captureData.status !== 'COMPLETED') {
      return res.status(400).json({ 
        error: 'El pago no pudo ser capturado exitosamente', 
        status: captureData.status 
      });
    }

    // 2. Construir la dirección completa en el backend para guardar en la base de datos
    const parts = [];
    if (form.calle) parts.push(`${form.calle} ${form.numExt} ${form.numInt ? 'Int. ' + form.numInt : ''}`.trim());
    if (form.colonia) parts.push(`Col. ${form.colonia}`);
    if (form.ciudad) parts.push(form.ciudad);
    if (form.estado) parts.push(form.estado);
    if (form.cp) parts.push(`C.P. ${form.cp}`);
    if (form.pais) parts.push(form.pais);
    const domicilio = parts.join(', ');

    // Generar un número de orden único corto
    const orden = Math.floor(100000 + Math.random() * 900000).toString();

    // 3. Registrar el pedido en la base de datos local
    const result = await pool.query(
      `INSERT INTO pedidos (orden, nombre, correo, telefono, pais, estado_env, ciudad, calle, num_ext, num_int, colonia, cp, domicilio, notas, items, subtotal, envio, total) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
      [
        orden,
        form.nombre,
        form.correo,
        form.telefono,
        form.pais,
        form.estado,
        form.ciudad,
        form.calle,
        form.numExt,
        form.numInt || null,
        form.colonia,
        form.cp,
        domicilio,
        form.notas || null,
        JSON.stringify(items),
        subtotal,
        envio,
        total
      ]
    );

    // 4. Insertar en historial de estados del pedido
    await pool.query(
      `INSERT INTO pedido_historial (pedido_id, estado) VALUES ($1, $2)`,
      [result.rows[0].id, 'Nuevo']
    );

    // Retornar la orden local creada
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('PayPal Order Capture Error:', err.message);
    res.status(500).json({ error: 'Error al capturar o registrar el pedido', details: err.message });
  }
});

// --- Auth Routes ---

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE correo = $1 OR nombre = $1',
      [username]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Credenciales incorrectas' });
    const token = jwt.sign(
      { id: user.id, username: user.nombre, email: user.correo, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, admin: { id: user.id, username: user.nombre, email: user.correo, rol: user.rol } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'No autorizado' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query('SELECT id, nombre, correo, rol FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    const u = result.rows[0];
    res.json({ admin: { id: u.id, username: u.nombre, email: u.correo, rol: u.rol } });
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
});

// --- Users CRUD ---

app.get('/api/users', async (_req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, correo, rol, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch users' }); }
});

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT id, nombre, correo, rol, created_at FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch user' }); }
});

app.post('/api/users', async (req, res) => {
  const { nombre, correo, rol, password } = req.body;
  if (!nombre || !correo || !rol || !password) return res.status(400).json({ error: 'All fields are required' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (nombre, correo, rol, password) VALUES ($1, $2, $3, $4) RETURNING id, nombre, correo, rol',
      [nombre, correo, rol, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Failed to create user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol, password } = req.body;
  try {
    let query, params;
    if (password && password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = 'UPDATE users SET nombre=$1, correo=$2, rol=$3, password=$4 WHERE id=$5 RETURNING id, nombre, correo, rol';
      params = [nombre, correo, rol, hashedPassword, id];
    } else {
      query = 'UPDATE users SET nombre=$1, correo=$2, rol=$3 WHERE id=$4 RETURNING id, nombre, correo, rol';
      params = [nombre, correo, rol, id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete user' }); }
});

// --- Products CRUD ---

// GET all products
app.get('/api/products', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*,
        (SELECT MIN(pv.precio) FROM product_variations pv WHERE pv.product_id = p.id) AS min_v_price,
        (SELECT COUNT(*) FROM product_variations pv WHERE pv.product_id = p.id) AS variaciones_count
      FROM products p
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `);
    
    // Fallback: If main price is null (common in variable products), use the min variation price
    const products = result.rows.map(p => ({
      ...p,
      precio: p.precio !== null && p.precio !== undefined ? p.precio : p.min_v_price
    }));
    
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET single product with variations
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const product = await pool.query('SELECT * FROM products WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (product.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    const variations = await pool.query('SELECT * FROM product_variations WHERE product_id = $1 ORDER BY id', [id]);
    res.json({ ...product.rows[0], variaciones: variations.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST create product
app.post('/api/products', upload.any(), async (req, res) => {
  const { nombre, descripcion, precio, stock, envio_especial, peso, es_variable, es_publico, slug, atributos, variaciones, tienda, flag, preventa_inicio, preventa_fin } = req.body;

  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });

  const files = req.files || [];
  const imagen_url   = files.find(f => f.fieldname === 'imagen')?.path || null;
  const galeria_urls = files.filter(f => f.fieldname === 'galeria').map(f => f.path);
  const varImgMap    = {};
  files.filter(f => f.fieldname.startsWith('varImg_')).forEach(f => {
    const idx = parseInt(f.fieldname.replace('varImg_', ''));
    varImgMap[idx] = f.path;
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const productSlug = slug || nombre
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    const result = await client.query(
      `INSERT INTO products (nombre, descripcion, precio, stock, envio_especial, peso, es_variable, es_publico, slug, imagen_url, galeria_urls, atributos, tienda, flag, preventa_inicio, preventa_fin)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) RETURNING *`,
      [
        nombre, descripcion || null,
        precio ? parseFloat(precio) : null,
        stock ? parseInt(stock) : 0,
        envio_especial ? parseFloat(envio_especial) : null,
        peso ? parseFloat(peso) : null,
        es_variable === 'true', es_publico !== 'false',
        productSlug, imagen_url, JSON.stringify(galeria_urls),
        atributos || null, tienda || 'General', flag || null,
        (flag === 'Preventa' && preventa_inicio) ? preventa_inicio : null,
        (flag === 'Preventa' && preventa_fin)    ? preventa_fin    : null
      ]
    );

    const product = result.rows[0];

    if (es_variable === 'true' && variaciones) {
      const vars = JSON.parse(variaciones);
      for (let i = 0; i < vars.length; i++) {
        const v = vars[i];
        // Use newly uploaded Cloudinary URL, or existing URL (not blobs)
        const varImg = varImgMap[i] || (v.imagen_url && !v.imagen_url.startsWith('blob:') ? v.imagen_url : null);
        await client.query(
          `INSERT INTO product_variations (product_id, valor, precio, stock, color, imagen_url)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [product.id, v.valor, v.precio ? parseFloat(v.precio) : null, v.stock ? parseInt(v.stock) : 0, v.color || null, varImg]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json(product);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  } finally {
    client.release();
  }
});

// PUT update product
app.put('/api/products/:id', upload.any(), async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, stock, envio_especial, peso, es_variable, es_publico, slug, atributos, variaciones, tienda, flag, preventa_inicio, preventa_fin } = req.body;

  if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });

  const files = req.files || [];
  const varImgMap = {};
  files.filter(f => f.fieldname.startsWith('varImg_')).forEach(f => {
    const idx = parseInt(f.fieldname.replace('varImg_', ''));
    varImgMap[idx] = f.path;
  });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const productSlug = slug || nombre
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    const existing = await client.query('SELECT imagen_url, galeria_urls FROM products WHERE id = $1', [id]);
    if (existing.rows.length === 0) throw new Error('Product not found');

    let imagen_url = existing.rows[0].imagen_url;
    const newMainImg = files.find(f => f.fieldname === 'imagen');
    if (newMainImg) imagen_url = newMainImg.path;

    let galeria_urls = existing.rows[0].galeria_urls || [];
    const newGaleria = files.filter(f => f.fieldname === 'galeria');
    if (newGaleria.length) galeria_urls = [...galeria_urls, ...newGaleria.map(f => f.path)];

    const result = await client.query(
      `UPDATE products SET nombre=$1, descripcion=$2, precio=$3, stock=$4, envio_especial=$5, es_variable=$6, es_publico=$7, slug=$8, imagen_url=$9, galeria_urls=$10, atributos=$11, tienda=$13, flag=$14, preventa_inicio=$15, preventa_fin=$16, peso=$17
       WHERE id=$12 RETURNING *`,
      [
        nombre, descripcion || null,
        precio ? parseFloat(precio) : null,
        stock ? parseInt(stock) : 0,
        envio_especial ? parseFloat(envio_especial) : null,
        es_variable === 'true', es_publico !== 'false',
        productSlug, imagen_url, JSON.stringify(galeria_urls),
        atributos || null, id, tienda || 'General', flag || null,
        (flag === 'Preventa' && preventa_inicio) ? preventa_inicio : null,
        (flag === 'Preventa' && preventa_fin)    ? preventa_fin    : null,
        peso ? parseFloat(peso) : null
      ]
    );

    const product = result.rows[0];

    await client.query('DELETE FROM product_variations WHERE product_id = $1', [id]);
    if (es_variable === 'true' && variaciones) {
      const vars = JSON.parse(variaciones);
      for (let i = 0; i < vars.length; i++) {
        const v = vars[i];
        const varImg = varImgMap[i] || (v.imagen_url && !v.imagen_url.startsWith('blob:') ? v.imagen_url : null);
        await client.query(
          `INSERT INTO product_variations (product_id, valor, precio, stock, color, imagen_url)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [product.id, v.valor, v.precio ? parseFloat(v.precio) : null, v.stock ? parseInt(v.stock) : 0, v.color || null, varImg]
        );
      }
    }

    await client.query('COMMIT');
    res.json(product);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  } finally {
    client.release();
  }
});

// DELETE product (Soft Delete)
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Upload image only
app.post('/api/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: req.file.path, public_id: req.file.filename });
});

// Basic routes
app.get('/', (_req, res) => res.json({ message: 'Amigo Merch API is running' }));

app.get('/db-test', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'Connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// --- Tiendas CRUD ---

// GET all tiendas
app.get('/api/tiendas', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tiendas WHERE deleted_at IS NULL ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tiendas' });
  }
});

// GET single tienda
app.get('/api/tiendas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM tiendas WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tienda no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tienda' });
  }
});

// POST create tienda
app.post('/api/tiendas', uploadTienda.fields([{ name: 'imagen', maxCount: 1 }, { name: 'header', maxCount: 1 }]), async (req, res) => {
  try {
    const { nombre, publico } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });
    const imagen_url = req.files?.imagen?.[0]?.path || null;
    const header_url = req.files?.header?.[0]?.path || null;
    const result = await pool.query(
      'INSERT INTO tiendas (nombre, publico, imagen_url, header_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, publico === 'true', imagen_url, header_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create tienda', details: err.message });
  }
});

// PUT update tienda
app.put('/api/tiendas/:id', uploadTienda.fields([{ name: 'imagen', maxCount: 1 }, { name: 'header', maxCount: 1 }]), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, publico } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre es requerido' });

    const existing = await pool.query('SELECT imagen_url, header_url FROM tiendas WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Tienda no encontrada' });

    const imagen_url = req.files?.imagen?.[0]?.path ?? existing.rows[0].imagen_url;
    const header_url = req.files?.header?.[0]?.path ?? existing.rows[0].header_url;

    const result = await pool.query(
      'UPDATE tiendas SET nombre = $1, publico = $2, imagen_url = $3, header_url = $4 WHERE id = $5 RETURNING *',
      [nombre, publico === 'true', imagen_url, header_url, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update tienda', details: err.message });
  }
});

// DELETE tienda
app.delete('/api/tiendas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE tiendas SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [id]);
    res.json({ message: 'Tienda eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete tienda' });
  }
});

// --- Pedidos CRUD ---

// GET all pedidos
app.get('/api/pedidos', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pedidos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pedidos' });
  }
});

// GET pedido by orden number (public tracker – only safe fields returned)
app.get('/api/pedidos/orden/:orden', async (req, res) => {
  try {
    const { orden } = req.params;
    const result = await pool.query(
      `SELECT p.id, p.orden, p.nombre, p.estado, p.created_at,
         COALESCE(
           (SELECT json_agg(h ORDER BY h.created_at ASC)
            FROM pedido_historial h
            WHERE h.pedido_id = p.id),
           '[]'::json
         ) as historial
       FROM pedidos p WHERE UPPER(p.orden) = UPPER($1)`,
      [orden.trim()]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pedido' });
  }
});

// GET single pedido
app.get('/api/pedidos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch pedido' });
  }
});

// POST create pedido
app.post('/api/pedidos', async (req, res) => {
  try {
    const { nombre, correo, telefono, pais, estado_env, ciudad, calle, num_ext, num_int, colonia, cp, domicilio, notas, items, subtotal, envio, total } = req.body;
    
    // Generar un número de orden único corto
    const orden = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await pool.query(
      `INSERT INTO pedidos (orden, nombre, correo, telefono, pais, estado_env, ciudad, calle, num_ext, num_int, colonia, cp, domicilio, notas, items, subtotal, envio, total) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
      [orden, nombre, correo, telefono, pais, estado_env, ciudad, calle, num_ext, num_int, colonia, cp, domicilio, notas, JSON.stringify(items), subtotal, envio, total]
    );

    // Insertar en historial
    await pool.query(
      `INSERT INTO pedido_historial (pedido_id, estado) VALUES ($1, $2)`,
      [result.rows[0].id, 'Nuevo']
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create pedido', details: err.message });
  }
});

// PUT update pedido estado (+ dispara correo según el estado)
app.put('/api/pedidos/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const VALID = ['Nuevo', 'En proceso', 'Completado', 'Fallido', 'Cancelado'];
    if (!VALID.includes(estado)) return res.status(400).json({ error: 'Estado inválido' });

    const result = await pool.query(
      'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    // Insertar en historial
    await pool.query(
      `INSERT INTO pedido_historial (pedido_id, estado) VALUES ($1, $2)`,
      [id, estado]
    );

    const pedido = result.rows[0];
    // Enviar correo en background (no bloqueamos la respuesta)
    sendStatusEmail(pedido, estado).catch(console.error);

    res.json({ ...pedido, emailEnviado: !!EMAIL_TRIGGERS[estado] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update pedido estado' });
  }
});

// --- Envia.com API Integration ---

const getEnviaPayload = async (pedido) => {
  let totalWeight = 0;
  for (const item of (pedido.items || [])) {
    const prodId = item.producto_id || item.id;
    if (isNaN(parseInt(prodId, 10))) continue; // Evitar error de postgres si el ID es un string alfa
    const pRes = await pool.query('SELECT peso FROM products WHERE id = $1', [parseInt(prodId, 10)]);
    const pPeso = pRes.rows[0]?.peso ? parseFloat(pRes.rows[0].peso) : 1;
    totalWeight += pPeso * item.cantidad;
  }
  if (totalWeight < 1) totalWeight = 1;

  const map = {
    'aguascalientes': 'AG', 'baja california': 'BC', 'baja california sur': 'BS',
    'campeche': 'CM', 'chiapas': 'CS', 'chihuahua': 'CH', 'ciudad de mexico': 'CX', 'ciudad de méxico': 'CX', 'cdmx': 'CX',
    'coahuila': 'CO', 'colima': 'CL', 'durango': 'DG', 'estado de mexico': 'EM', 'estado de méxico': 'EM',
    'guanajuato': 'GT', 'guerrero': 'GR', 'hidalgo': 'HG', 'jalisco': 'JA', 'michoacan': 'MI', 'michoacán': 'MI',
    'morelos': 'MO', 'nayarit': 'NA', 'nuevo leon': 'NL', 'nuevo león': 'NL', 'oaxaca': 'OA', 'puebla': 'PU',
    'queretaro': 'QT', 'querétaro': 'QT', 'quintana roo': 'QR', 'san luis potosi': 'SL', 'san luis potosí': 'SL',
    'sinaloa': 'SI', 'sonora': 'SO', 'tabasco': 'TB', 'tamaulipas': 'TM', 'tlaxcala': 'TL', 'veracruz': 'VE',
    'yucatan': 'YU', 'yucatán': 'YU', 'zacatecas': 'ZA'
  };
  const stateCode = map[(pedido.estado_env || '').toLowerCase().trim()] || 'JA';

  return {
    origin: {
      name: 'Amigo Merch', company: 'Amigo Merch', email: 'hola@amigomerch.mx', phone: '3312345678',
      street: 'Bodega Principal', number: '1', district: 'Centro', city: 'Zapopan', state: 'JA', country: 'MX', postalCode: '45200', reference: ''
    },
    destination: {
      name: pedido.nombre, company: '', email: pedido.correo || 'hola@amigomerch.mx', phone: pedido.telefono || '3300000000',
      street: pedido.calle || 'Conocida', number: pedido.num_ext || 'SN', district: pedido.colonia || 'Centro', city: pedido.ciudad || 'Ciudad', state: stateCode, country: pedido.pais === 'Mexico' ? 'MX' : 'MX', postalCode: pedido.cp || '00000', reference: pedido.notas || ''
    },
    packages: [{
      content: 'Ropa y Accesorios', amount: 1, type: 'box', weight: totalWeight, insurance: 0, declaredValue: parseFloat(pedido.total), weightUnit: 'KG', lengthUnit: 'CM', dimensions: { length: 30, width: 20, height: 10 }
    }],
    settings: { printFormat: 'PDF', printSize: 'STOCK_4X6' }
  };
};

app.post('/api/pedidos/:id/cotizar-envio', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Pedido no encontrado' });
    
    const payload = await getEnviaPayload(rows[0]);
    // Request basic carriers to quote. In real scenario we could map all or specific ones
    const carriers = ['fedex', 'dhl', 'estafeta', 'redpack'];
    const rates = [];

    // Cotizamos uno por uno para asegurar que regresen resultados (algunas configs de Envia requieren enviar carrier en /ship/rate)
    for (const carrier of carriers) {
      try {
        const ratePayload = { ...payload, shipment: { carrier, type: 1 } };
        const response = await fetch(`${process.env.ENVIA_API_URL}/ship/rate/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.ENVIA_API_KEY}` },
          body: JSON.stringify(ratePayload)
        });
        const data = await response.json();
        if (data.meta === 'rate' && data.data && data.data.length > 0) {
          rates.push(...data.data);
        }
      } catch (e) { console.error(`Error rating ${carrier}:`, e); }
    }

    res.json({ rates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to quote shipping' });
  }
});

app.post('/api/pedidos/:id/generar-guia', async (req, res) => {
  try {
    const { id } = req.params;
    const { carrier, service } = req.body;
    
    const { rows } = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Pedido no encontrado' });
    
    if (rows[0].tracking_number) {
      return res.status(400).json({ error: 'Este pedido ya tiene una guía generada' });
    }

    const payload = await getEnviaPayload(rows[0]);
    payload.shipment = { carrier, service, type: 1 };

    const response = await fetch(`${process.env.ENVIA_API_URL}/ship/generate/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.ENVIA_API_KEY}` },
      body: JSON.stringify(payload)
    });
    const data = await response.json();

    if (data.meta !== 'generate') {
      return res.status(400).json({ error: 'Error al generar la guía con Envia.com', details: data.error || data });
    }

    const trackingNumber = data.data[0].trackingNumber;
    const guiaUrl = data.data[0].label;

    const result = await pool.query(
      'UPDATE pedidos SET tracking_number = $1, guia_url = $2 WHERE id = $3 RETURNING *',
      [trackingNumber, guiaUrl, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate label' });
  }
});

// --- Boletines CRUD ---

// GET all boletines
app.get('/api/boletines', async (_req, res) => {
  try {
    const r = await pool.query('SELECT id, asunto, estado, created_at, sent_at FROM boletines ORDER BY created_at DESC');
    res.json(r.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch boletines' }); }
});

// GET single boletin
app.get('/api/boletines/:id', async (req, res) => {
  try {
    const r = await pool.query('SELECT * FROM boletines WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(r.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to fetch boletin' }); }
});

// POST create boletin (borrador)
app.post('/api/boletines', async (req, res) => {
  const { asunto = '', html = '' } = req.body;
  try {
    const r = await pool.query(
      'INSERT INTO boletines (asunto, html, estado) VALUES ($1, $2, $3) RETURNING *',
      [asunto.trim(), html, 'Borrador']
    );
    res.status(201).json(r.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create boletin' }); }
});

// PATCH update boletin (asunto, html, estado)
app.patch('/api/boletines/:id', async (req, res) => {
  const { asunto, html, estado } = req.body;
  const VALID_ESTADOS = ['Borrador', 'Programado', 'Enviado'];
  if (estado && !VALID_ESTADOS.includes(estado)) return res.status(400).json({ error: 'Estado inválido' });
  try {
    const r = await pool.query(
      `UPDATE boletines SET
        asunto     = COALESCE($1, asunto),
        html       = COALESCE($2, html),
        estado     = COALESCE($3, estado)
       WHERE id = $4 RETURNING *`,
      [asunto ?? null, html ?? null, estado ?? null, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json(r.rows[0]);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update boletin' }); }
});

// DELETE boletin
app.delete('/api/boletines/:id', async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM boletines WHERE id = $1 RETURNING id', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'No encontrado' });
    res.json({ deleted: r.rows[0].id });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to delete boletin' }); }
});

// POST enviar boletin a todos los suscriptores
app.post('/api/boletines/:id/enviar', async (req, res) => {
  try {
    // 1. Obtener el boletín
    const bRes = await pool.query('SELECT * FROM boletines WHERE id = $1', [req.params.id]);
    if (!bRes.rows.length) return res.status(404).json({ error: 'Boletín no encontrado' });
    const boletin = bRes.rows[0];

    if (boletin.estado === 'Enviado') {
      return res.status(400).json({ error: 'Este boletín ya fue enviado anteriormente.' });
    }

    // 2. Obtener suscriptores filtrados por destinatarios seleccionados
    const sRes = await pool.query('SELECT nombre, correo FROM suscriptores ORDER BY created_at ASC');
    let suscriptores = sRes.rows;

    // Si el cliente envió una lista de destinatarios, filtramos
    const { destinatarios } = req.body;
    if (Array.isArray(destinatarios) && destinatarios.length > 0) {
      const setDest = new Set(destinatarios.map(d => d.toLowerCase()));
      suscriptores = suscriptores.filter(s => setDest.has(s.correo.toLowerCase()));
    }

    if (suscriptores.length === 0) {
      return res.status(400).json({ error: 'No hay destinatarios seleccionados o ninguno coincide con suscriptores registrados.' });
    }

    // 3. Enviar correos (en paralelo con Promise.allSettled para no fallar si uno falla)
    let enviados = 0;
    let fallidos = 0;

    if (process.env.SMTP_USER) {
      const results = await Promise.allSettled(
        suscriptores.map(s =>
          mailer.sendMail({
            from:    `"Amigo Merch" <develop@dmncrt.com>`,
            to:      s.correo,
            subject: boletin.asunto,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
                ${boletin.html}
                <hr style="border:none;border-top:1px solid #eee;margin:32px 0;">
                <p style="color:#aaa;font-size:11px;text-align:center;">
                  Hola ${s.nombre}, recibiste este correo porque estás suscrito al newsletter de Amigo Merch.<br>
                  <a href="#" style="color:#aaa;">Cancelar suscripción</a>
                </p>
              </div>
            `,
          })
        )
      );
      enviados = results.filter(r => r.status === 'fulfilled').length;
      fallidos = results.filter(r => r.status === 'rejected').length;
    } else {
      console.log(`[EMAIL SKIPPED] No SMTP_USER. Would send "${boletin.asunto}" to ${suscriptores.length} suscriptores.`);
      enviados = suscriptores.length; // simular éxito en dev
    }

    // 4. Actualizar estado del boletín a Enviado
    await pool.query(
      "UPDATE boletines SET estado = 'Enviado', sent_at = NOW() WHERE id = $1",
      [req.params.id]
    );

    res.json({
      ok:        true,
      enviados,
      fallidos,
      total:     suscriptores.length,
      emailReal: !!process.env.SMTP_USER,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar el boletín.' });
  }
});


// --- Clientes (derivados de pedidos) ---


// GET all clientes – agrupados por correo desde la tabla pedidos
app.get('/api/clientes', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        correo,
        MAX(nombre)                            AS nombre,
        MAX(telefono)                          AS telefono,
        COUNT(*)::int                          AS total_pedidos,
        SUM(total)::numeric                    AS total_gastado,
        MIN(created_at)                        AS primera_compra,
        MAX(created_at)                        AS ultima_compra
      FROM pedidos
      GROUP BY correo
      ORDER BY ultima_compra DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch clientes' });
  }
});

// GET detalle de un cliente: todos sus pedidos ordenados desc
app.get('/api/clientes/:correo', async (req, res) => {
  try {
    const { correo } = req.params;
    const result = await pool.query(
      `SELECT id, orden, nombre, correo, telefono, ciudad, estado, total, created_at
       FROM pedidos
       WHERE LOWER(correo) = LOWER($1)
       ORDER BY created_at DESC`,
      [correo]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cliente pedidos' });
  }
});

// --- Suscriptores ---


// GET all suscriptores
app.get('/api/suscriptores', async (_req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, correo, created_at FROM suscriptores ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch suscriptores' });
  }
});

// POST create suscriptor
app.post('/api/suscriptores', async (req, res) => {
  const { nombre, correo } = req.body;
  if (!nombre || !correo) return res.status(400).json({ error: 'Nombre y correo son requeridos' });
  try {
    // Generate a random 8-char alphanumeric ID
    const id = Math.random().toString(36).substring(2, 10).toUpperCase();
    const result = await pool.query(
      'INSERT INTO suscriptores (id, nombre, correo) VALUES ($1, $2, $3) RETURNING *',
      [id, nombre.trim(), correo.trim().toLowerCase()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Este correo ya está registrado' });
    console.error(err);
    res.status(500).json({ error: 'Failed to create suscriptor' });
  }
});

// DELETE suscriptor
app.delete('/api/suscriptores/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM suscriptores WHERE id = $1', [id]);
    res.json({ message: 'Suscriptor eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete suscriptor' });
  }
});

// --- Estadísticas ---
app.get('/api/estadisticas/live', async (_req, res) => {
  try {
    // 1. Pedidos Nuevos
    const pnRes = await pool.query("SELECT COUNT(*) FROM pedidos WHERE estado = 'Nuevo'");
    const pedidosNuevos = parseInt(pnRes.rows[0].count, 10);

    // 2. Ingresos del día
    // 'CURRENT_DATE' usa la zona horaria del servidor
    const indRes = await pool.query("SELECT SUM(total) FROM pedidos WHERE DATE(created_at) = CURRENT_DATE AND estado NOT IN ('Cancelado', 'Fallido')");
    const ingresosHoy = parseFloat(indRes.rows[0].sum || 0);

    // 3. Best Seller (Producto más vendido activo)
    const bsRes = await pool.query(`
      SELECT p.id, p.nombre, p.imagen_principal, p.precio, SUM((i->>'cantidad')::int) as vendidos
      FROM pedidos ped
      CROSS JOIN json_array_elements(ped.items::json) as i
      JOIN productos p ON (i->>'id')::int = p.id
      WHERE p.activo = true AND ped.estado NOT IN ('Cancelado', 'Fallido')
      GROUP BY p.id, p.nombre, p.imagen_principal, p.precio
      ORDER BY vendidos DESC
      LIMIT 1
    `);
    const bestSeller = bsRes.rows.length ? bsRes.rows[0] : null;

    res.json({
      pedidosNuevos,
      ingresosHoy,
      bestSeller
    });
  } catch (err) {
    console.error('Error fetching estadisticas:', err);
    res.status(500).json({ error: 'Failed to fetch estadisticas' });
  }
});

// Ventas por mes (Cardiograma)
app.get('/api/estadisticas/ventas-mes', async (req, res) => {
  try {
    const today = new Date();
    const year = parseInt(req.query.anio) || today.getFullYear();
    const month = parseInt(req.query.mes) || (today.getMonth() + 1);

    const result = await pool.query(`
      SELECT 
        EXTRACT(DAY FROM created_at) AS dia,
        SUM(total) AS total_dia
      FROM pedidos
      WHERE 
        EXTRACT(YEAR FROM created_at) = $1
        AND EXTRACT(MONTH FROM created_at) = $2
        AND estado NOT IN ('Cancelado', 'Fallido')
      GROUP BY dia
      ORDER BY dia ASC
    `, [year, month]);

    // Format output as array of { dia, total }
    const datosDia = result.rows.map(r => ({
      dia: parseInt(r.dia, 10),
      total: parseFloat(r.total_dia)
    }));

    res.json({ anio: year, mes: month, datos: datosDia });
  } catch (err) {
    console.error('Error fetching ventas-mes:', err);
    res.status(500).json({ error: 'Failed to fetch ventas-mes' });
  }
});

// --- Reporte de Ventas Mensuales ---
// GET /api/reportes/ventas?anio=2025&tienda_id=1&mes=Enero
app.get('/api/reportes/ventas', async (req, res) => {
  try {
    const today = new Date();
    const anio = parseInt(req.query.anio) || today.getFullYear();
    const { tienda_id, mes } = req.query;

    const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

    // Use EXTRACT(MONTH) to avoid locale-dependent TO_CHAR month names (English vs Spanish)
    let query = `
      SELECT
        EXTRACT(MONTH FROM p.created_at)::int AS mes_num,
        item->>'nombre' AS producto,
        SUM((item->>'cantidad')::numeric * (item->>'precio')::numeric) AS total
      FROM pedidos p
      CROSS JOIN json_array_elements(p.items::json) AS item
      WHERE
        EXTRACT(YEAR FROM p.created_at) = $1
        AND p.estado NOT IN ('Cancelado', 'Fallido')
    `;

    const params = [anio];
    let paramIdx = 2;

    // Filter by tienda using EXISTS subquery
    // NOTE: items JSON uses 'producto_id' (not 'id') for the real product ID
    if (tienda_id && tienda_id !== 'todas') {
      const tiendaRes = await pool.query('SELECT nombre FROM tiendas WHERE id = $1', [tienda_id]);
      if (tiendaRes.rows.length) {
        query += ` AND EXISTS (
          SELECT 1 FROM products WHERE id = (item->>'producto_id')::int AND tienda = $${paramIdx}
        )`;
        params.push(tiendaRes.rows[0].nombre);
        paramIdx++;
      }
    }

    // Filter by specific month number
    if (mes && mes !== 'todos') {
      const mesNum = MESES.indexOf(mes) + 1;
      if (mesNum > 0) {
        query += ` AND EXTRACT(MONTH FROM p.created_at) = $${paramIdx}`;
        params.push(mesNum);
        paramIdx++;
      }
    }

    query += `
      GROUP BY mes_num, item->>'nombre'
      ORDER BY mes_num ASC, producto ASC
    `;

    const result = await pool.query(query, params);

    // Build monthly totals for charts using Spanish month names
    const porMes = {};
    MESES.forEach(m => { porMes[m] = 0; });

    const rows = result.rows.map(r => {
      const mesNombre = MESES[r.mes_num - 1]; // Map month number → Spanish name
      const total = parseFloat(r.total);
      if (porMes[mesNombre] !== undefined) porMes[mesNombre] += total;
      return { mes: mesNombre, producto: r.producto, total };
    });

    res.json({ rows, porMes });
  } catch (err) {
    console.error('Error fetching reporte ventas:', err);
    res.status(500).json({ error: 'Failed to fetch reporte de ventas', details: err.message });
  }
});

app.get('/api/reportes/inventario', async (_req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.nombre as producto_nombre,
        p.stock as producto_stock,
        COALESCE(
          json_agg(
            json_build_object('id', pv.id, 'valor', pv.valor, 'stock', pv.stock)
          ) FILTER (WHERE pv.id IS NOT NULL),
          '[]'
        ) as variaciones
      FROM products p
      LEFT JOIN product_variations pv ON p.id = pv.product_id
      WHERE p.deleted_at IS NULL
      GROUP BY p.id, p.nombre, p.stock
      ORDER BY p.nombre ASC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching inventario:', err);
    res.status(500).json({ error: 'Failed to fetch inventario' });
  }
});

// --- Shipping Rules ---
app.get('/api/shipping-rules', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM shipping_rules ORDER BY created_at ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching shipping rules:', err);
    res.status(500).json({ error: 'Failed to fetch shipping rules' });
  }
});

app.post('/api/shipping-rules', async (req, res) => {
  const { paises, estados, precio } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO shipping_rules (paises, estados, precio) VALUES ($1, $2, $3) RETURNING *',
      [JSON.stringify(paises), JSON.stringify(estados), precio]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error creating shipping rule:', err);
    res.status(500).json({ error: 'Failed to create shipping rule' });
  }
});

app.delete('/api/shipping-rules/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM shipping_rules WHERE id = $1', [id]);
    res.json({ message: 'Shipping rule deleted' });
  } catch (err) {
    console.error('Error deleting shipping rule:', err);
    res.status(500).json({ error: 'Failed to delete shipping rule' });
  }
});

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error('Global error:', err);
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: 'Error al subir archivo', details: err.message });
  }
  res.status(500).json({ error: 'Error interno del servidor', details: err.message || err.toString() });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;


