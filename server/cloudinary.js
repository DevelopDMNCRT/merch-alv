require('dotenv').config();
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Storage para productos y variaciones ────────────────────────────────────
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Merch Alv/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

// ── Storage para tiendas (imágenes de portada y header) ─────────────────────
const tiendaStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Merch Alv/tiendas',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

// ── Storage para noticias / news ─────────────────────────────────────────────
const newsStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'Merch Alv/news',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  },
});

const upload        = multer({ storage: productStorage });
const uploadTienda  = multer({ storage: tiendaStorage });
const uploadNews    = multer({ storage: newsStorage });

module.exports = { cloudinary, upload, uploadTienda, uploadNews };
