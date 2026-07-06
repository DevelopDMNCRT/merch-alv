require('dotenv').config();
const nodemailer = require('nodemailer');

const TEST_EMAIL = 'elmer.eyca@gmail.com';

const mailer = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// ─── Merch ALV Brand ─────────────────────────────────────────────────────────
const BRAND_NAME  = 'Merch ALV';
const BRAND_EMAIL = 'contacto@merchalv.mx';
const BRAND_URL   = 'https://merch-alv-client.vercel.app';
// Logo en Cloudinary (CDN pública — Gmail la carga automáticamente)
const LOGO_URL = 'https://res.cloudinary.com/db2v3qrxn/image/upload/v1783363125/merchalv/merchalv-logo-email.png';

// ─── Layout base ─────────────────────────────────────────────────────────────
const emailWrap = (inner) => `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Merch ALV</title>
</head>
<body style="margin:0;padding:20px;background:#f4f4f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <div style="max-width:580px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08)">

    <!-- Header negro con logo Cloudinary -->
    <div style="background:#000000;padding:22px 28px;text-align:left">
      <img src="${LOGO_URL}" alt="Merch ALV" width="200" height="44" style="display:block;filter:invert(1);-webkit-filter:invert(1)" />
    </div>

    <!-- Cuerpo -->
    <div style="padding:32px 28px">
      ${inner}

      <!-- Footer -->
      <hr style="border:none;border-top:1px solid #e4e4e7;margin:32px 0 20px 0">
      <p style="color:#a1a1aa;font-size:12px;text-align:center;margin:0">
        ${BRAND_NAME} &nbsp;&middot;&nbsp;
        <a href="mailto:${BRAND_EMAIL}" style="color:#a1a1aa;text-decoration:none">${BRAND_EMAIL}</a>
      </p>
    </div>

  </div>
</body>
</html>`;

const btnBlack = (href, text) =>
  `<div style="text-align:center;margin:28px 0">
    <a href="${href}" style="background:#000000;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;letter-spacing:0.5px">${text}</a>
  </div>`;

const btnRed = (href, text) =>
  `<div style="text-align:center;margin:28px 0">
    <a href="${href}" style="background:#ef4444;color:#ffffff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;letter-spacing:0.5px">${text}</a>
  </div>`;

// ─── Pedido de muestra ────────────────────────────────────────────────────────
const pedido = {
  orden: '123456',
  nombre: 'Elmer García',
  correo: TEST_EMAIL,
  items: [
    { nombre: 'Camiseta Logo', variante: 'M / Negro', cantidad: 2, precio: 299 },
    { nombre: 'Taza Personalizada', cantidad: 1, precio: 150 },
  ],
  subtotal: 748,
  envio: 99,
  total: 847,
  domicilio: 'Av. Constitución 456, Col. Centro, Guadalajara, Jalisco, 44100',
  paqueteria: 'FedEx',
  num_rastreo: 'FDX-78901234',
};

// ─── Plantillas ───────────────────────────────────────────────────────────────
function confirmacionHtml(p) {
  const items = p.items || [];
  const rows = items.map(i =>
    `<tr>
      <td style="padding:10px 0;border-bottom:1px solid #e4e4e7;font-size:13px;color:#3f3f46">
        ${i.nombre}${i.variante ? ` <span style="color:#a1a1aa">(${i.variante})</span>` : ''}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #e4e4e7;font-size:13px;color:#3f3f46;text-align:center">${i.cantidad}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e4e4e7;font-size:13px;color:#3f3f46;text-align:right">$${parseFloat(i.precio).toFixed(2)}</td>
    </tr>`
  ).join('');

  return emailWrap(`
    <h1 style="color:#000;font-size:22px;font-weight:800;margin:0 0 8px 0">¡Gracias por tu pedido! 🎉</h1>
    <p style="color:#3f3f46;margin:0 0 24px 0;line-height:1.7">
      Hola <strong>${p.nombre}</strong>,<br>
      Hemos recibido tu pedido correctamente. En breve recibirás confirmación de pago y comenzaremos a prepararlo.
    </p>

    <div style="background:#f4f4f5;border-radius:8px;padding:20px;margin:0 0 20px 0">
      <p style="margin:0 0 14px 0;font-weight:700;color:#000;font-size:14px">
        Resumen de tu pedido <span style="color:#71717a;font-weight:400">#${p.orden}</span>
      </p>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr>
            <th style="text-align:left;font-size:11px;color:#a1a1aa;padding-bottom:8px;border-bottom:2px solid #e4e4e7;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Producto</th>
            <th style="text-align:center;font-size:11px;color:#a1a1aa;padding-bottom:8px;border-bottom:2px solid #e4e4e7;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Cant.</th>
            <th style="text-align:right;font-size:11px;color:#a1a1aa;padding-bottom:8px;border-bottom:2px solid #e4e4e7;text-transform:uppercase;letter-spacing:0.5px;font-weight:600">Precio</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:14px;text-align:right;border-top:1px solid #e4e4e7;padding-top:12px">
        <p style="margin:0 0 4px 0;font-size:13px;color:#71717a">Envío: <strong style="color:#3f3f46">$${parseFloat(p.envio).toFixed(2)}</strong></p>
        <p style="margin:0;font-size:16px;font-weight:800;color:#000">Total: $${parseFloat(p.total).toFixed(2)}</p>
      </div>
    </div>

    <p style="color:#71717a;font-size:13px;margin:0 0 24px 0">
      📍 Dirección de entrega: <strong style="color:#3f3f46">${p.domicilio}</strong>
    </p>
    <p style="color:#3f3f46;margin:0;line-height:1.6">Puedes rastrear el estado de tu pedido en cualquier momento:</p>
    ${btnBlack(BRAND_URL + '/rastreo', 'Rastrear mi pedido')}
  `);
}

const EMAIL_TRIGGERS = {
  'En proceso': (p) => ({
    subject: `¡Estamos procesando tu pedido #${p.orden}! — ${BRAND_NAME}`,
    html: emailWrap(`
      <h1 style="color:#000;font-size:22px;font-weight:800;margin:0 0 8px 0">¡Estamos procesando tu pedido! ⚙️</h1>
      <p style="color:#3f3f46;margin:0 0 24px 0;line-height:1.7">
        Hola <strong>${p.nombre}</strong>,<br>
        Hemos confirmado tu pago y <strong>ya estamos preparando tu pedido #${p.orden}</strong> con todo el cariño para que llegue perfecto a tus manos.
      </p>
      <p style="color:#3f3f46;margin:0;line-height:1.6">Te avisaremos en cuanto lo enviemos. Puedes consultar el estado aquí:</p>
      ${btnBlack(BRAND_URL + '/rastreo', 'Rastrear mi pedido')}
      <div style="background:#f4f4f5;border-radius:6px;padding:14px 18px">
        <p style="margin:0;color:#71717a;font-size:13px">Número de pedido: <strong style="color:#000">#${p.orden}</strong></p>
      </div>
    `)
  }),
  'Guía Generada': (p) => ({
    subject: `¡Tu pedido #${p.orden} va en camino! — ${BRAND_NAME}`,
    html: emailWrap(`
      <h1 style="color:#000;font-size:22px;font-weight:800;margin:0 0 8px 0">¡Tu pedido va en camino! 🚚</h1>
      <p style="color:#3f3f46;margin:0 0 24px 0;line-height:1.7">
        Hola <strong>${p.nombre}</strong>,<br>
        ¡Buenas noticias! Tu pedido <strong>#${p.orden}</strong> ha sido enviado y está en camino a tu domicilio.
      </p>
      ${p.paqueteria ? `
      <div style="background:#f4f4f5;border-left:4px solid #000;padding:16px 18px;border-radius:4px;margin:0 0 24px 0">
        <p style="margin:0 0 8px 0;font-weight:700;color:#000;font-size:14px">Información de envío</p>
        <p style="margin:0 0 4px 0;font-size:14px;color:#3f3f46">📦 Paquetería: <strong>${p.paqueteria}</strong></p>
        ${p.num_rastreo ? `<p style="margin:0;font-size:14px;color:#3f3f46">🔍 N° de rastreo: <strong>${p.num_rastreo}</strong></p>` : ''}
      </div>` : ''}
      <p style="color:#3f3f46;margin:0;line-height:1.6">¿Tienes alguna duda? Contáctanos:</p>
      ${btnBlack(BRAND_URL + '/contacto', 'Contactar a soporte')}
    `)
  }),
  'Cancelado': (p) => ({
    subject: `Tu pedido #${p.orden} ha sido cancelado — ${BRAND_NAME}`,
    html: emailWrap(`
      <h1 style="color:#ef4444;font-size:22px;font-weight:800;margin:0 0 8px 0">Pedido cancelado</h1>
      <p style="color:#3f3f46;margin:0 0 24px 0;line-height:1.7">
        Hola <strong>${p.nombre}</strong>,<br>
        Lamentamos informarte que tu pedido <strong>#${p.orden}</strong> ha sido cancelado.
      </p>
      <p style="color:#3f3f46;margin:0;line-height:1.6">Si crees que esto es un error o necesitas ayuda, nuestro equipo está listo para atenderte:</p>
      ${btnRed(BRAND_URL + '/contacto', 'Ir a la sección de contacto')}
    `)
  }),
  'Fallido': (p) => ({
    subject: `Tuvimos un problema con tu pedido #${p.orden} — ${BRAND_NAME}`,
    html: emailWrap(`
      <h1 style="color:#ef4444;font-size:22px;font-weight:800;margin:0 0 8px 0">Hubo un problema con tu pago 😔</h1>
      <p style="color:#3f3f46;margin:0 0 24px 0;line-height:1.7">
        Hola <strong>${p.nombre}</strong>,<br>
        Lamentamos informarte que no pudimos procesar el pago de tu pedido <strong>#${p.orden}</strong>.
      </p>
      <p style="color:#3f3f46;margin:0 0 24px 0;line-height:1.6">
        Esto puede ocurrir por distintas razones: fondos insuficientes, datos incorrectos o una restricción de tu banco. ¡Pero no te preocupes, puedes intentarlo nuevamente!
      </p>
      ${btnBlack(BRAND_URL, 'Intentar de nuevo')}
      <p style="color:#71717a;font-size:13px;margin:0">Si el problema persiste, contáctanos y con gusto te ayudamos.</p>
    `)
  }),
};

// ─── Envío ────────────────────────────────────────────────────────────────────
async function sendAll() {
  console.log(`\n🔧 SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`);
  console.log(`📤 From: ${process.env.SMTP_FROM}`);
  console.log(`📨 To: ${TEST_EMAIL}\n`);

  const FROM = process.env.SMTP_FROM || `"${BRAND_NAME}" <${process.env.SMTP_USER}>`;

  // 1. Confirmación de pedido
  console.log('1️⃣  Enviando: Confirmación de pedido...');
  try {
    await mailer.sendMail({
      from: FROM, replyTo: BRAND_EMAIL, to: TEST_EMAIL,
      subject: `[TEST] ¡Gracias por tu pedido #${pedido.orden}! — ${BRAND_NAME}`,
      html: confirmacionHtml(pedido),
    });
    console.log('   ✅ Enviado!\n');
  } catch (e) { console.error('   ❌ Error:', e.message, '\n'); }

  // 2-5. Estados
  for (const [estado, fn] of Object.entries(EMAIL_TRIGGERS)) {
    const { subject, html } = fn(pedido);
    console.log(`📧  Enviando estado: "${estado}"...`);
    try {
      await mailer.sendMail({
        from: FROM, replyTo: BRAND_EMAIL, to: TEST_EMAIL,
        subject: `[TEST] ${subject}`, html,
      });
      console.log('   ✅ Enviado!\n');
    } catch (e) { console.error('   ❌ Error:', e.message, '\n'); }
  }

  console.log('🎉 ¡Todos los correos procesados!');
}

sendAll().catch(console.error);
