# Merch ALV — Plataforma E-Commerce 🛒

Proyecto integral de comercio electrónico de Merch ALV, conformado por una tienda pública (`/client`), un panel de administración (`/admin`) y un servidor central (`/server`) para procesar pagos, notificaciones y envíos.

---

## 📝 Últimos Cambios (Julio 2026)

- **Actualización de Branding:** Se reemplazaron todas las referencias estáticas (hardcodeadas) de la plantilla anterior por la nueva marca "Merch ALV" en todo el panel de administración, incluyendo correos automáticos, títulos de página y vistas de inicio de sesión.
- **Sincronización de Base de Datos:** Se ejecutaron scripts de migración para homologar la base de datos local con las nuevas funcionalidades del servidor. Se crearon las tablas requeridas (`clientes`, `product_variations`, `reglas_envio`, `configuracion`) y se agregaron las columnas faltantes (`delegacion`, `paqueteria`, `num_rastreo` en `pedidos`), resolviendo así los errores 500 al intentar acceder a los clientes o realizar compras.
- **Restauración de PayPal:** Se removió por completo la integración de MercadoPago (utilizada en la plantilla base) y se restauraron las rutas nativas de PayPal (`/api/paypal/create-order` y `/api/paypal/capture-order`). Esto permite nuevamente los pagos desde la tienda pública y, además, los enlaza automáticamente con el nuevo sistema de notificaciones SMTP y descuento de stock en inventario.
- **Limpieza de Entorno:** Se purgaron las carpetas de respaldo obsoletas (`admin_old_backup` y `server_old_backup`) así como los scripts temporales de migración en el servidor, dejando el repositorio de producción completamente limpio.
