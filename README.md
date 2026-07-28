# Merch ALV — Plataforma E-Commerce 🛒

Proyecto integral de comercio electrónico de Merch ALV, conformado por una tienda pública (`/client`), un panel de administración (`/admin`) y un servidor central (`/server`) para procesar pagos, notificaciones y envíos.

---

## 📝 Últimos Cambios (Julio 2026)

- **Actualización de Branding:** Se reemplazaron todas las referencias estáticas (hardcodeadas) de la plantilla anterior por la nueva marca "Merch ALV" en todo el panel de administración, incluyendo correos automáticos, títulos de página y vistas de inicio de sesión.
- **Sincronización de Base de Datos:** Se ejecutaron scripts de migración para homologar la base de datos local con las nuevas funcionalidades del servidor. Se crearon las tablas requeridas (`clientes`, `product_variations`, `reglas_envio`, `configuracion`) y se agregaron las columnas faltantes (`delegacion`, `paqueteria`, `num_rastreo` en `pedidos`), resolviendo así los errores 500 al intentar acceder a los clientes o realizar compras.
- **Integración de Mercado Pago:** Se configuró la pasarela de pagos con Mercado Pago (rutas `/api/config/mercadopago`, `/api/mercadopago/create-preference` y `/api/mercadopago/process-payment`). Esto permite cobros con tarjetas de crédito y débito a través de Mercado Pago Bricks en la tienda pública y enlaza automáticamente los cobros aprobados con las notificaciones SMTP y el descuento de stock en inventario.
- **Sistema de Notificaciones (SMTP):** Se rediseñó el sistema de envío de correos electrónicos transaccionales. Se reemplazaron todas las referencias y el estilo antiguo (Amigo Merch) por el Branding oficial de Merch ALV (esquema blanco/negro/rojo). Las plantillas ahora incluyen el logo alojado en Cloudinary para eludir los bloqueos de imágenes en línea que aplica Gmail y se resolvieron los conflictos de autenticación SMTP (`550 Sender address is not allowed`) ajustando el correo de remitección adecuado (`develop@dmncrt.com`).
- **Remoción de Notificaciones Innecesarias:** Se eliminó el botón de la campana de notificaciones de la barra de navegación del panel de administración [AppHeader.vue] y su lógica asociada para simplificar la interfaz.
- **Homologación de Branding en Login:** Se rediseñó la vista de inicio de sesión del panel de administración [Signin.vue], sustituyendo el fondo verde y círculos amarillos por un fondo negro y acentos rojos institucionales.
- **Mejoras en Reporte de Stock PDF:** Se actualizó la cabecera de la tabla del inventario a color negro con una línea roja de acento y se incorporó el logotipo oficial `logo-light-01.png` en la esquina superior derecha del PDF, optimizando además la tipografía del título e indicador de stock.
- **Módulo de Cotizaciones y Contacto:** Se implementó un modal interactivo en el botón "Cotizar Proyecto" de la tienda pública [HomeView.vue] para capturar Nombre, Teléfono y Servicio, enlazado a un nuevo endpoint en el servidor (`/api/quote`) que envía solicitudes estructuradas por correo. Se depuró también el endpoint de contacto general (`/api/contact`) retirando referencias previas.
- **Limpieza de Entorno:** Se purgaron las carpetas de respaldo obsoletas (`admin_old_backup` y `server_old_backup`) así como los scripts temporales de migración en el servidor, dejando el repositorio de producción completamente limpio.
