require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { upload } = require('./cloudinary');
const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');
const csv = require('csv-parser');

const localUpload = multer({ dest: '/tmp/' });
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
app.get('/api/config/paypal', (req, res) => {
  res.json({ clientId: PAYPAL_CLIENT_ID });
});

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

app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { orderID, form, items, subtotal, envio, total } = req.body;
    if (!orderID) return res.status(400).json({ error: 'orderID es requerido' });
    if (!form || !items || !total) return res.status(400).json({ error: 'Datos de pedido incompletos' });

    const captureData = await capturePayPalOrder(orderID);
    if (captureData.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'El pago no pudo ser capturado exitosamente', status: captureData.status });
    }

    const parts = [];
    if (form.calle) parts.push(`${form.calle} ${form.numExt} ${form.numInt ? 'Int. ' + form.numInt : ''}`.trim());
    if (form.colonia) parts.push(`Col. ${form.colonia}`);
    if (form.delegacion) parts.push(form.delegacion);
    if (form.ciudad) parts.push(form.ciudad);
    if (form.estado) parts.push(form.estado);
    if (form.cp) parts.push(`C.P. ${form.cp}`);
    if (form.pais) parts.push(form.pais);
    const domicilio = parts.join(', ');

    const orden = Math.floor(100000 + Math.random() * 900000).toString();

    const result = await pool.query(
      `INSERT INTO pedidos (orden, nombre, correo, telefono, pais, estado_env, ciudad, delegacion, calle, num_ext, num_int, colonia, cp, domicilio, notas, items, subtotal, envio, total, estado) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *`,
      [
        orden, form.nombre, form.correo, form.telefono, form.pais, form.estado, form.ciudad, form.delegacion || null, form.calle, form.numExt, form.numInt || null, form.colonia, form.cp, domicilio, form.notas || null, JSON.stringify(items), subtotal, envio, total, 'En proceso'
      ]
    );
    const pedidoCreado = result.rows[0];

    await pool.query(
      `INSERT INTO pedido_historial (pedido_id, estado) VALUES ($1, $2)`,
      [pedidoCreado.id, 'En proceso']
    );

    // Update stock and send email if functions exist
    if (typeof manejarDescuentoStock === 'function') {
      await manejarDescuentoStock(pedidoCreado.id, 'En proceso');
    }
    if (typeof sendOrderConfirmationEmail === 'function') {
      sendOrderConfirmationEmail(pedidoCreado).catch(console.error);
    }
    
    // Check if this user was already a client
    const clienteExistente = await pool.query('SELECT * FROM clientes WHERE correo = $1', [form.correo]);
    if (clienteExistente.rows.length === 0) {
      await pool.query(
        `INSERT INTO clientes (correo, nombre, telefono, ciudad, estado, pais, codigo_postal) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [form.correo, form.nombre, form.telefono, form.ciudad, form.estado, form.pais, form.cp]
      );
    }

    res.status(201).json(pedidoCreado);
  } catch (err) {
    console.error('PayPal Order Capture Error:', err.message);
    res.status(500).json({ error: 'Error al capturar o registrar el pedido', details: err.message });
  }
});

// --- Configuracion ---

app.get('/api/configuracion', async (req, res) => {
  try {
    const result = await pool.query('SELECT precio_envio, envia_token, envia_modo FROM configuracion LIMIT 1');
    if (result.rows.length === 0) return res.json({ precio_envio: 150, envia_token: '', envia_modo: 'sandbox' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener configuracion' });
  }
});

app.put('/api/configuracion', async (req, res) => {
  try {
    const { precio_envio, envia_token, envia_modo } = req.body;
    let result = await pool.query('UPDATE configuracion SET precio_envio = $1, envia_token = $2, envia_modo = $3 RETURNING *', [precio_envio, envia_token, envia_modo]);
    if (result.rows.length === 0) {
      result = await pool.query('INSERT INTO configuracion (precio_envio, envia_token, envia_modo) VALUES ($1, $2, $3) RETURNING *', [precio_envio, envia_token, envia_modo]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar configuracion' });
  }
});

// --- Reglas de Envío ---

app.get('/api/reglas-envio', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reglas_envio ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reglas de envio' });
  }
});

app.post('/api/reglas-envio', async (req, res) => {
  try {
    const { pais, estados, precio } = req.body;
    const result = await pool.query(
      'INSERT INTO reglas_envio (pais, estados, precio) VALUES ($1, $2, $3) RETURNING *',
      [pais, estados ? JSON.stringify(estados) : null, precio]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear regla de envio' });
  }
});

app.put('/api/reglas-envio/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { pais, estados, precio } = req.body;
    const result = await pool.query(
      'UPDATE reglas_envio SET pais = $1, estados = $2, precio = $3 WHERE id = $4 RETURNING *',
      [pais, estados ? JSON.stringify(estados) : null, precio, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Regla no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar regla de envio' });
  }
});

app.delete('/api/reglas-envio/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM reglas_envio WHERE id = $1', [id]);
    res.json({ message: 'Regla eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar regla de envio' });
  }
});


// --- Reporte PDF Stock ---

app.get('/api/reportes/stock-pdf', async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-stock.pdf');
    doc.pipe(res);
    
    const productsRes = await pool.query('SELECT id, nombre, es_variable, stock FROM products WHERE deleted_at IS NULL ORDER BY nombre');
    const varsRes = await pool.query('SELECT product_id, valor, color, stock FROM product_variations');
    
    let inventario = [];
    let totalPiezas = 0;
    
    for (const prod of productsRes.rows) {
      if (prod.es_variable) {
        const prodVars = varsRes.rows.filter(v => v.product_id === prod.id);
        if (prodVars.length > 0) {
          prodVars.forEach(v => {
            const varName = v.color ? `${v.valor} / ${v.color}` : v.valor;
            inventario.push({ producto: prod.nombre, variacion: varName, unidades: v.stock || 0 });
            totalPiezas += (v.stock || 0);
          });
        } else {
          inventario.push({ producto: prod.nombre, variacion: 'N/A', unidades: 0 });
        }
      } else {
        inventario.push({ producto: prod.nombre, variacion: 'N/A', unidades: prod.stock || 0 });
        totalPiezas += (prod.stock || 0);
      }
    }
    
    doc.fontSize(20).font('Helvetica').fillColor('#111827').text('Reporte de Inventario');
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total de piezas disponibles: ${totalPiezas}`);
    doc.moveDown(1.5);
    
    const tableTop = doc.y;
    const col1X = 50;
    const col2X = 260;
    const col3X = 400;
    const rowHeight = 25;
    let y = tableTop;

    const drawHeader = (startY) => {
      doc.rect(50, startY, 512, rowHeight).fill('#237650');
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF');
      doc.text('Producto', col1X + 10, startY + 8);
      doc.text('Variación (Talla/Color)', col2X + 10, startY + 8);
      doc.text('Unidades', col3X, startY + 8, { width: 150, align: 'right' });
      return startY + rowHeight;
    };

    y = drawHeader(y);

    for (let i = 0; i < inventario.length; i++) {
      const item = inventario[i];
      
      if (y > 700) {
        doc.addPage();
        y = 50;
        y = drawHeader(y);
      }
      
      if (i % 2 !== 0) {
        doc.rect(50, y, 512, rowHeight).fill('#F9FAFB');
      } else {
        doc.rect(50, y, 512, rowHeight).fill('#FFFFFF');
      }
      
      doc.font('Helvetica').fontSize(10).fillColor('#6B7280');
      
      let pName = item.producto;
      if (pName.length > 40) pName = pName.substring(0, 37) + '...';
      let vName = item.variacion;
      if (vName.length > 25) vName = vName.substring(0, 22) + '...';
      
      doc.text(pName, col1X + 10, y + 8, { lineBreak: false });
      doc.text(vName, col2X + 10, y + 8, { lineBreak: false });
      doc.text(item.unidades.toString(), col3X, y + 8, { width: 150, align: 'right', lineBreak: false });
      
      y += rowHeight;
    }
    
    doc.end();
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Error al generar PDF' });
    }
  }
});

app.get('/api/reportes/inventario', async (req, res) => {
  try {
    const productsRes = await pool.query('SELECT id, nombre, es_variable, stock, tienda FROM products WHERE deleted_at IS NULL ORDER BY nombre');
    const varsRes = await pool.query('SELECT product_id, valor, color, stock FROM product_variations');
    
    let inventario = [];
    let totalPiezas = 0;
    
    for (const prod of productsRes.rows) {
      const p = {
        id: prod.id,
        producto: prod.nombre,
        tienda: prod.tienda || 'General',
        total_unidades: 0,
        variaciones: []
      };

      if (prod.es_variable) {
        const prodVars = varsRes.rows.filter(v => v.product_id === prod.id);
        if (prodVars.length > 0) {
          prodVars.forEach(v => {
            const varName = v.color ? `${v.valor} / ${v.color}` : v.valor;
            const u = v.stock || 0;
            p.variaciones.push({ nombre: varName, unidades: u });
            p.total_unidades += u;
            totalPiezas += u;
          });
        }
      } else {
        const u = prod.stock || 0;
        p.variaciones.push({ nombre: 'N/A', unidades: u });
        p.total_unidades += u;
        totalPiezas += u;
      }
      
      inventario.push(p);
    }
    
    res.json({ totalPiezas, inventario });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener inventario' });
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

// --- Settings / Configuración ---
const initSettingsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        key VARCHAR(50) PRIMARY KEY,
        value TEXT
      )
    `);
    // Asegurar que exista la key mantenimiento
    await pool.query(`
      INSERT INTO settings (key, value) 
      VALUES ('mantenimiento', 'false')
      ON CONFLICT (key) DO NOTHING
    `);
    console.log('Settings table initialized');
  } catch (err) {
    console.error('Error initializing settings table:', err);
  }
};
initSettingsTable();

// GET mantenimiento status (public endpoint)
app.get('/api/settings/mantenimiento', async (_req, res) => {
  try {
    const result = await pool.query("SELECT value FROM settings WHERE key = 'mantenimiento'");
    const isMaintenance = result.rows.length > 0 && result.rows[0].value === 'true';
    res.json({ mantenimiento: isMaintenance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT mantenimiento status
app.put('/api/settings/mantenimiento', async (req, res) => {
  try {
    const { mantenimiento } = req.body;
    await pool.query(
      "UPDATE settings SET value = $1 WHERE key = 'mantenimiento'",
      [mantenimiento === true ? 'true' : 'false']
    );
    res.json({ mantenimiento: mantenimiento === true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;

// --- Package Presets ---
const initPackagePresetsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS package_presets (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL,
        tipo TEXT NOT NULL DEFAULT 'box',
        peso NUMERIC(6,2) NOT NULL,
        largo INT NOT NULL,
        ancho INT NOT NULL,
        alto INT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('Package presets table initialized');
  } catch (err) {
    console.error('Error initializing package_presets table:', err);
  }
};
initPackagePresetsTable();

// GET all package presets
app.get('/api/package-presets', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM package_presets ORDER BY nombre ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch package presets' });
  }
});

// POST create package preset
app.post('/api/package-presets', async (req, res) => {
  try {
    const { nombre, tipo, peso, largo, ancho, alto } = req.body;
    if (!nombre || !peso || !largo || !ancho || !alto) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    const { rows } = await pool.query(
      'INSERT INTO package_presets (nombre, tipo, peso, largo, ancho, alto) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [nombre, tipo || 'box', parseFloat(peso), parseInt(largo), parseInt(ancho), parseInt(alto)]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create package preset' });
  }
});

// PUT update package preset
app.put('/api/package-presets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, tipo, peso, largo, ancho, alto } = req.body;
    const { rows } = await pool.query(
      'UPDATE package_presets SET nombre=$1, tipo=$2, peso=$3, largo=$4, ancho=$5, alto=$6 WHERE id=$7 RETURNING *',
      [nombre, tipo || 'box', parseFloat(peso), parseInt(largo), parseInt(ancho), parseInt(alto), id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Preset no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update package preset' });
  }
});

// DELETE package preset
app.delete('/api/package-presets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM package_presets WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete package preset' });
  }
});
