<template>
  <main class="checkout-view">
    <div class="checkout-container">
      <div class="checkout-header">
        <h1>{{ t('checkout.title') }}</h1>
        <p>{{ t('checkout.subtitle') }}</p>
      </div>

      <div class="checkout-content">
        <!-- Formulario -->
        <div class="checkout-form-section">
          <h2>{{ t('checkout.contactData') }}</h2>
          <form class="checkout-form" ref="checkoutForm" @submit.prevent>
            
            <div class="form-row">
              <div class="form-group">
                <label>{{ t('checkout.fullName') }}</label>
                <input type="text" required placeholder="Juan Pérez" v-model="form.nombre" class="form-input">
              </div>
              <div class="form-group">
                <label>{{ t('checkout.phone') }}</label>
                <input type="tel" required placeholder="(55) 1234 5678" v-model="form.telefono" class="form-input">
              </div>
            </div>

            <div class="form-group">
              <label>{{ t('checkout.email') }}</label>
              <input type="email" required placeholder="tu@correo.com" v-model="form.correo" class="form-input">
            </div>

            <h2 class="mt-4">{{ t('checkout.shippingAddress') }}</h2>
            
            <div class="form-group">
              <label>{{ t('checkout.country') }}</label>
              <select required class="form-input" v-model="form.pais" @change="onPaisChange">
                <option value="México">México</option>
                <option value="Estados Unidos">Estados Unidos</option>
                <option value="Argentina">Argentina</option>
                <option value="Colombia">Colombia</option>
                <option value="Panamá">Panamá</option>
                <option value="España">España</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ t('checkout.stateProvince') }}</label>
                <select required class="form-input" v-model="form.estado" @change="checkShippingSupport">
                  <option value="" disabled selected>{{ t('checkout.selectState') }}</option>
                  <option v-for="estado in currentStates" :key="estado" :value="estado">{{ estado }}</option>
                </select>
              </div>
              <div class="form-group">
                <label>{{ t('checkout.city') }}</label>
                <input type="text" required placeholder="Ej. Monterrey" v-model="form.ciudad" class="form-input">
              </div>
            </div>

            <div class="form-row mt-3">
              <div class="form-group" style="flex: 2;">
                <label>{{ t('checkout.street') }}</label>
                <input type="text" required placeholder="Av. Insurgentes Sur" v-model="form.calle" class="form-input">
              </div>
              <div class="form-group" style="flex: 1;">
                <label>{{ t('checkout.numExt') }}</label>
                <input type="text" required placeholder="123" v-model="form.numExt" class="form-input">
              </div>
              <div class="form-group" style="flex: 1;">
                <label>{{ t('checkout.numInt') }}</label>
                <input type="text" placeholder="Apto 4" v-model="form.numInt" class="form-input">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>{{ t('checkout.colonia') }}</label>
                <input type="text" required placeholder="Roma Norte" v-model="form.colonia" class="form-input">
              </div>
              <div class="form-group">
                <label>{{ t('checkout.postalCode') }}</label>
                <input type="text" required placeholder="06700" v-model="form.cp" class="form-input">
              </div>
            </div>

            <div class="form-group">
              <label>{{ t('checkout.notes') }}</label>
              <textarea placeholder="Ej. Dejar con el guardia, casa color azul con reja blanca..." rows="2" v-model="form.notas" class="form-input"></textarea>
            </div>

            <button type="button" class="btn-location" @click="openMapModal">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {{ t('checkout.addLocation') }}
            </button>

            <div v-if="loading" class="text-center font-bold my-4">Procesando pedido...</div>

            <!-- PayPal Card Fields Inline Payment Section -->
            <div class="paypal-card-fields-section mt-4" v-if="cartState.items.length > 0">
              <h3>Detalles del Pago</h3>
              <p class="payment-method-subtitle">Ingresa los datos de tu tarjeta de crédito o débito de manera segura y directa.</p>

              <!-- Banner de Depuración Visual -->
              <div v-if="paypalDebugMessage" class="paypal-debug-banner" style="background:#fffbeb;border:1px solid #fef3c7;color:#b45309;padding:16px;border-radius:12px;font-size:0.95rem;margin-bottom:20px;font-family:'Jost',sans-serif;font-weight:600;line-height:1.5;white-space:pre-line;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
                ⚠️ <strong>Estado de Conexión:</strong>
                {{ paypalDebugMessage }}
              </div>

              <!-- Formulario de Campos de Tarjeta -->
              <div class="card-form-container" v-if="!showFallbackButtons">
                <div class="form-group">
                  <label>Nombre del Titular</label>
                  <input type="text" id="card-holder-name" v-model="formCardholderName" required placeholder="Nombre completo del titular" class="form-input">
                </div>

                <div class="form-group">
                  <label>Número de Tarjeta</label>
                  <div id="card-number-container" class="hosted-field-container" :class="{ 'focused': focusState.number, 'invalid': errors.number }"></div>
                  <span class="field-error" v-if="errors.number">{{ errors.number }}</span>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Fecha de Vencimiento</label>
                    <div id="card-expiry-container" class="hosted-field-container" :class="{ 'focused': focusState.expiry, 'invalid': errors.expiry }"></div>
                    <span class="field-error" v-if="errors.expiry">{{ errors.expiry }}</span>
                  </div>
                  <div class="form-group">
                    <label>CVV</label>
                    <div id="card-cvv-container" class="hosted-field-container" :class="{ 'focused': focusState.cvv, 'invalid': errors.cvv }"></div>
                    <span class="field-error" v-if="errors.cvv">{{ errors.cvv }}</span>
                  </div>
                </div>

                <button type="button" class="pay-btn mt-4" :disabled="loading || cartState.items.length === 0 || !isShippingSupported" @click="submitCardPayment">
                  <span v-if="loading">
                    <svg class="animate-spin h-5 w-5 mr-3 inline" viewBox="0 0 24 24" fill="none" style="width:20px;height:20px;display:inline-block;vertical-align:middle;margin-right:8px;">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" style="opacity:0.25;"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style="opacity:0.75;"></path>
                    </svg>
                    Procesando Pago Seguro...
                  </span>
                  <span v-else>
                    Pagar {{ isShippingSupported ? formatPrice(cartGetters.totalPrice.value + costoEnvio) : '---' }}
                  </span>
                </button>
              </div>

              <!-- Contenedor Fallback de Botones Inteligentes de PayPal (con opción de tarjeta inline) -->
              <div v-else class="paypal-fallback-container mt-4">
                <div id="paypal-button-container-fallback"></div>
              </div>
            </div>

            <!-- Botón de simulación removido para producción -->
          </form>
        </div>

        <!-- Resumen -->
        <div class="checkout-summary-section">
          <h2>{{ t('checkout.orderSummary') }}</h2>
          
          <div class="cart-items-summary" v-if="cartState.items.length > 0">
            <div class="summary-item" v-for="item in cartState.items" :key="item.cartItemId">
              <img :src="item.image" :alt="item.name">
              <div class="summary-item-info">
                <h4>{{ item.name }}</h4>
                <p>{{ t('checkout.sizeLabel') }}: {{ item.size }} | {{ t('checkout.quantityLabel') }}: {{ item.quantity }}</p>
                <span class="summary-item-price">{{ formatPrice(item.price * item.quantity) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="empty-summary">
            <p>{{ t('checkout.emptyCart') }}</p>
          </div>

          <div class="summary-totals">
            <div class="total-row">
              <span>{{ t('checkout.subtotal') }}</span>
              <span>{{ formatPrice(cartGetters.totalPrice.value) }}</span>
            </div>
            <div class="total-row">
              <span>{{ t('checkout.shipping') }}</span>
              <span v-if="isShippingSupported">{{ formatPrice(costoEnvio) }}</span>
              <span v-else class="text-red-500 font-bold">No disponible</span>
            </div>
            <div class="total-row grand-total">
              <span>{{ t('checkout.total') }}</span>
              <span>{{ isShippingSupported ? formatPrice(cartGetters.totalPrice.value + costoEnvio) : '---' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Map Modal -->
    <Teleport to="body">
      <transition name="fade-modal">
        <div v-if="isMapModalOpen" class="map-modal-overlay" @click.self="closeMapModal">
          <div class="map-modal-content">
            <div class="map-modal-header">
              <h3>{{ t('checkout.confirmLocationTitle') }}</h3>
              <button @click="closeMapModal" class="close-modal-btn" aria-label="Cerrar">&times;</button>
            </div>
            <div class="map-modal-body">
              <p class="map-hint">{{ t('checkout.mapHint') }}</p>
              <div id="modal-map" class="map-container"></div>
            </div>
            <div class="map-modal-footer">
              <button @click="confirmLocation" class="confirm-location-btn">{{ t('checkout.saveLocation') }}</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Error Modal Envío -->
    <Teleport to="body">
      <transition name="fade-modal">
        <div v-if="shippingErrorModalOpen" class="map-modal-overlay" @click.self="shippingErrorModalOpen = false">
          <div class="map-modal-content" style="max-width: 400px; text-align: center;">
            <div class="map-modal-body" style="padding: 30px 20px;">
              <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto mb-4 text-red-500 w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 class="text-xl font-bold mb-2">Envío No Disponible</h3>
              <p class="text-gray-600 mb-6">Lo sentimos, no contamos con tarifas de envío configuradas para tu zona actual. Por favor intenta con otra dirección.</p>
              <button @click="shippingErrorModalOpen = false" class="confirm-location-btn w-full">Entendido</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </main>
</template>

<script setup>
import { onMounted, ref, reactive, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { cartState, cartGetters, cartActions } from '../store/cart.js'
import { useLocale } from '../composables/useLocale.js'
import { formatPrice } from '../store/locale.js'
import { loadScript } from "@paypal/paypal-js"

const { t } = useLocale()

const router = useRouter()

import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

const loadLeaflet = async () => {
  // Ya está cargado estáticamente
}

const statesData = {
  'México': ['Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 'CDMX', 'Chiapas', 'Chihuahua', 'Coahuila', 'Colima', 'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas'],
  'Estados Unidos': ['California', 'Texas', 'Florida', 'New York', 'Illinois', 'Otro'],
  'Argentina': ['Buenos Aires', 'CABA', 'Córdoba', 'Santa Fe', 'Mendoza', 'Otro'],
  'Colombia': ['Antioquia', 'Bogotá', 'Valle del Cauca', 'Cundinamarca', 'Atlántico', 'Otro'],
  'Panamá': ['Panamá', 'Colón', 'Chiriquí', 'Bocas del Toro', 'Coclé', 'Otro'],
  'España': ['Madrid', 'Cataluña', 'Andalucía', 'Valencia', 'Galicia', 'Otro']
}

const form = reactive({
  nombre: '',
  telefono: '',
  correo: '',
  pais: 'México',
  estado: '',
  ciudad: '',
  calle: '',
  numExt: '',
  numInt: '',
  colonia: '',
  cp: '',
  notas: ''
})

const shippingRules = ref([])
const shippingErrorModalOpen = ref(false)

const costoEnvio = computed(() => {
  // 1. Siempre validar si la zona tiene cobertura primero.
  if (!form.pais) return null;

  const validRules = shippingRules.value.filter(r => r.paises && r.paises.includes(form.pais));
  if (validRules.length === 0) return null;

  let baseShippingPrice = null;

  if (form.pais === 'México') {
    const exactStateMatch = validRules.find(r => r.estados && r.estados.includes(form.estado));
    if (exactStateMatch) {
      baseShippingPrice = Number(exactStateMatch.precio);
    } else {
      const genericCountryMatch = validRules.find(r => !r.estados || r.estados.length === 0);
      if (genericCountryMatch) {
        baseShippingPrice = Number(genericCountryMatch.precio);
      } else {
        return null; // No hay regla para este estado y tampoco hay genérica para México
      }
    }
  } else {
    baseShippingPrice = Number(validRules[0].precio);
  }

  // 2. Si la zona es válida, revisamos si algún producto tiene "Envío Especial" que sea el REY
  let specialShipping = 0;
  for (const item of cartState.items) {
    const itemEnvio = Number(item.envio_especial || 0);
    if (itemEnvio > specialShipping) {
      specialShipping = itemEnvio;
    }
  }

  // Si hay envío especial, este se impone. Si no, usamos el base.
  if (specialShipping > 0) {
    return specialShipping;
  }

  return baseShippingPrice;
})

const isShippingSupported = computed(() => costoEnvio.value !== null)

const currentStates = computed(() => statesData[form.pais] || [])

const onPaisChange = () => {
  form.estado = ''
  checkShippingSupport()
}

const checkShippingSupport = () => {
  if (form.pais && (form.pais !== 'México' || form.estado)) {
    if (!isShippingSupported.value) {
      shippingErrorModalOpen.value = true
    }
  }
}

// Watcher or blur can also trigger checkShippingSupport, but we'll do it on select change.


// Map Modal Logic
const isMapModalOpen = ref(false)
let map = null
let marker = null
let confirmedLatLng = null

const openMapModal = async () => {
  isMapModalOpen.value = true
  await loadLeaflet()

  nextTick(() => {
    if (!map) {
      const initialCoords = [19.4326, -99.1332]

      map = L.map('modal-map').setView(initialCoords, 14)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      }).addTo(map)

      const brandIcon = L.divIcon({
        className: 'custom-brand-marker',
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:48px; height:48px; margin-top:-48px; margin-left:-24px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="#ffffff"></circle></svg>`,
        iconSize: [0, 0],
        iconAnchor: [0, 0]
      })

      marker = L.marker(initialCoords, { draggable: true, icon: brandIcon }).addTo(map)
      setTimeout(() => { map.invalidateSize() }, 100)
    }

    updateMapFromAddress()
  })
}

const closeMapModal = () => {
  isMapModalOpen.value = false
}

const confirmLocation = () => {
  if (marker) {
    confirmedLatLng = marker.getLatLng()
    console.log('Location confirmed:', confirmedLatLng.lat, confirmedLatLng.lng)
  }
  closeMapModal()
}

const updateMapFromAddress = async () => {
  const queriesToTry = [];
  
  // Nivel 1: Dirección completa
  const fullParts = [];
  if (form.calle) fullParts.push(`${form.calle} ${form.numExt}`);
  if (form.colonia) fullParts.push(form.colonia);
  if (form.ciudad) fullParts.push(form.ciudad);
  if (form.estado) fullParts.push(form.estado);
  if (form.pais) fullParts.push(form.pais);
  if (fullParts.length >= 3) queriesToTry.push(fullParts.filter(Boolean).join(', '));

  // Nivel 2: Sin calle (solo colonia, ciudad, estado, país)
  const medParts = [];
  if (form.colonia) medParts.push(form.colonia);
  if (form.ciudad) medParts.push(form.ciudad);
  if (form.estado) medParts.push(form.estado);
  if (form.pais) medParts.push(form.pais);
  if (medParts.length >= 2) queriesToTry.push(medParts.filter(Boolean).join(', '));

  // Nivel 3: Solo ciudad, estado, país
  const basicParts = [];
  if (form.ciudad) basicParts.push(form.ciudad);
  if (form.estado) basicParts.push(form.estado);
  if (form.pais) basicParts.push(form.pais);
  if (basicParts.length >= 1) queriesToTry.push(basicParts.filter(Boolean).join(', '));

  if (queriesToTry.length === 0) return;

  for (const query of queriesToTry) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        map.flyTo([lat, lon], 16, { animate: true, duration: 1.5 });
        marker.setLatLng([lat, lon]);
        return; // Éxito, salir del loop
      }
    } catch (err) {
      console.warn("Geocoding step failed for query: " + query, err);
    }
  }
}

const checkoutForm = ref(null)

const formCardholderName = ref('')
const cardBrandText = ref('TARJETA')
const cardBrandClass = ref('generic')
const focusState = reactive({
  number: false,
  expiry: false,
  cvv: false
})
const errors = reactive({
  number: '',
  expiry: '',
  cvv: ''
})
const paypalDebugMessage = ref('')
const showFallbackButtons = ref(false)

let cardFieldsInstance = null

onMounted(async () => {
  if (cartState.items.length === 0) {
    router.push('/')
    return
  }

  try {
    const rulesRes = await fetch('/api/shipping-rules');
    if (rulesRes.ok) {
      shippingRules.value = await rulesRes.json();
    }
  } catch (err) {
    console.error('Error fetching shipping rules:', err);
  }

  try {
    // 1. Obtener Client ID dinámicamente desde el backend
    paypalDebugMessage.value = 'Conectando con el servidor local para obtener credenciales...'
    const configRes = await fetch('/api/config/paypal')
    if (!configRes.ok) throw new Error('Error al consultar el servidor local /api/config/paypal')
    const configData = await configRes.json()
    const clientId = configData.clientId

    if (!clientId) {
      throw new Error('El Client ID de PayPal recibido está vacío. Verifica que PAYPAL_CLIENT_ID esté configurado en tu servidor/.env')
    }

    paypalDebugMessage.value = `Cargando el SDK seguro de PayPal (ID: ${clientId.substring(0, 15)}...)`

    // 2. Cargar SDK de JavaScript de PayPal con components=card-fields
    const paypal = await loadScript({ 
      "client-id": clientId,
      currency: "MXN",
      components: "card-fields"
    })

    if (!paypal) {
      throw new Error('No se pudo cargar el SDK de PayPal (objeto window.paypal no definido).')
    }

    if (!paypal.CardFields) {
      paypalDebugMessage.value = 'Nota: La función avanzada "Card Fields" no está disponible en esta cuenta o región.\nCargando los botones inteligentes de PayPal de forma segura con opción de Tarjeta Inline...';
      showFallbackButtons.value = true;
      
      await nextTick(); // Esperar a que se monte el contenedor
      
      await paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay'
        },
        onClick: (data, actions) => {
          if (!checkoutForm.value.checkValidity()) {
            checkoutForm.value.reportValidity();
            return actions.reject();
          }
          return actions.resolve();
        },
        createOrder: async () => {
          if (!isShippingSupported.value) throw new Error('Envío no soportado');
          const total = cartGetters.totalPrice.value + costoEnvio.value;
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ total })
          });
          if (!res.ok) throw new Error('Error al crear la orden');
          const order = await res.json();
          return order.id;
        },
        onApprove: async (data) => {
          loading.value = true;
          try {
            const subtotal = cartGetters.totalPrice.value;
            const envio = costoEnvio.value;
            const total = subtotal + envio;

            const items = cartState.items.map(item => ({
              id: item.cartItemId,
              producto_id: item.id,
              nombre: item.name,
              variante: item.size,
              imagen: item.image,
              precio: item.price,
              cantidad: item.quantity
            }));

            const payload = {
              orderID: data.orderID,
              form: {
                nombre: form.nombre,
                telefono: form.telefono,
                correo: form.correo,
                pais: form.pais,
                estado: form.estado,
                ciudad: form.ciudad,
                calle: form.calle,
                numExt: form.numExt,
                numInt: form.numInt,
                colonia: form.colonia,
                cp: form.cp,
                notes: form.notes
              },
              items,
              subtotal,
              envio,
              total
            };

            const res = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });

            if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error || 'Error al capturar orden en el servidor');
            }

            alert('¡Pedido confirmado exitosamente!');
            cartActions.clearCart();
            router.push('/');
          } catch (error) {
            console.error('Error al capturar orden en fallback:', error);
            alert(`Hubo un problema al procesar el pago: ${error.message}`);
          } finally {
            loading.value = false;
          }
        },
        onError: (err) => {
          console.error("PayPal Smart Buttons Fallback Error:", err);
          alert("Ocurrió un error con el pago de PayPal.");
        }
      }).render("#paypal-button-container-fallback");

      return;
    }

    paypalDebugMessage.value = 'Inicializando el formulario seguro de tarjeta...'

    // Detectar si el modo oscuro está activo para aplicar estilos visuales idénticos en los iframes
    const isDark = document.documentElement.classList.contains('dark') || 
                   document.body.classList.contains('dark') || 
                   document.documentElement.getAttribute('data-theme') === 'dark';

    const hostedFieldStyle = {
      input: {
        'font-size': '16px',
        'font-family': 'Jost, sans-serif',
        'color': isDark ? '#ffffff' : '#1f2937',
        'border': 'none !important',
        'outline': 'none !important',
        'box-shadow': 'none !important',
        'background': 'transparent !important',
        'padding': '0 16px'
      },
      ':focus': {
        'border': 'none !important',
        'outline': 'none !important',
        'box-shadow': 'none !important'
      },
      '.invalid': {
        'color': '#ef4444',
        'border': 'none !important',
        'outline': 'none !important',
        'box-shadow': 'none !important'
      },
      '.valid': {
        'border': 'none !important',
        'outline': 'none !important',
        'box-shadow': 'none !important'
      }
    }

    // 3. Inicializar el componente CardFields de PayPal
    const cardFields = paypal.CardFields({
      style: hostedFieldStyle,
      createOrder: async () => {
        try {
          if (!isShippingSupported.value) throw new Error('Envío no soportado');
          const total = cartGetters.totalPrice.value + costoEnvio.value;
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ total })
          });
          if (!res.ok) throw new Error('Error al registrar la orden en el servidor');
          const order = await res.json();
          return order.id;
        } catch (err) {
          console.error('Error en createOrder:', err);
          throw err;
        }
      },
      onApprove: async (data) => {
        try {
          loading.value = true;
          const subtotal = cartGetters.totalPrice.value;
          const envio = costoEnvio.value;
          const total = subtotal + envio;

          const items = cartState.items.map(item => ({
            id: item.cartItemId,
            producto_id: item.id,
            nombre: item.name,
            variante: item.size,
            imagen: item.image,
            precio: item.price,
            cantidad: item.quantity
          }));

          const payload = {
            orderID: data.orderID,
            form: {
              nombre: form.nombre,
              telefono: form.telefono,
              correo: form.correo,
              pais: form.pais,
              estado: form.estado,
              ciudad: form.ciudad,
              calle: form.calle,
              numExt: form.numExt,
              numInt: form.numInt,
              colonia: form.colonia,
              cp: form.cp,
              notes: form.notas
            },
            items,
            subtotal,
            envio,
            total
          };

          const res = await fetch('/api/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.error || 'Error en la respuesta del servidor');
          }

          alert('¡Pedido confirmado exitosamente!');
          cartActions.clearCart();
          router.push('/');
        } catch (error) {
          console.error('Error al capturar orden:', error);
          alert(`Hubo un problema al procesar el pago: ${error.message}`);
        } finally {
          loading.value = false;
        }
      },
      onError: (err) => {
        console.error('PayPal CardFields error:', err);
        alert('Hubo un error con la tarjeta ingresada. Verifica los datos.');
        loading.value = false;
      }
    });

    // Guardar instancia de CardFields
    cardFieldsInstance = cardFields;

    // Intentar renderizar los campos siempre para mayor compatibilidad
    try {
      paypalDebugMessage.value = 'Montando campo: Número de Tarjeta...'
      const numberField = cardFields.NumberField({ style: hostedFieldStyle });
      await numberField.render('#card-number-container');

      paypalDebugMessage.value = 'Montando campo: Fecha de Vencimiento...'
      const expiryField = cardFields.ExpiryField({ style: hostedFieldStyle });
      await expiryField.render('#card-expiry-container');

      paypalDebugMessage.value = 'Montando campo: Código de Seguridad (CVV)...'
      const cvvField = cardFields.CVVField({ style: hostedFieldStyle });
      await cvvField.render('#card-cvv-container');

      // Todo listo y cargado
      paypalDebugMessage.value = '';
    } catch (renderError) {
      throw new Error(`Error durante el montaje de los inputs seguros: ${renderError.message}`);
    }
  } catch (error) {
    paypalDebugMessage.value = `Error en pasarela: ${error.message}`;
    console.error("PayPal Init Error:", error);
  }
})

const loading = ref(false)



// Envío del pago directo con tarjeta
const submitCardPayment = async () => {
  try {
    if (checkoutForm.value && !checkoutForm.value.checkValidity()) {
      checkoutForm.value.reportValidity();
      alert('Faltan campos obligatorios en el formulario de envío (parte superior). Por favor complétalos para poder continuar.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formCardholderName.value.trim()) {
      alert('Por favor ingresa el nombre del titular de la tarjeta.');
      return;
    }

    if (!cardFieldsInstance) {
      alert('La pasarela de pago aún no está lista. Intenta nuevamente.');
      return;
    }

    const state = cardFieldsInstance.getState();
    const isValidCard = state && state.isFormValid !== undefined 
      ? state.isFormValid 
      : (state && state.fields && state.fields.number && state.fields.number.isValid && state.fields.expiry.isValid && state.fields.cvv.isValid);
      
    if (!isValidCard) {
      alert('Por favor verifica los datos de tu tarjeta. Asegúrate de que el número, fecha y CVV estén completos y correctos.');
      return;
    }

    loading.value = true;
    await cardFieldsInstance.submit();
  } catch (err) {
    console.error('Submit Error Detallado:', err);
    alert('Error interno al procesar: ' + (err.message || JSON.stringify(err)));
    loading.value = false;
  }
};



const processCheckout = async (paypalOrderData = null) => {
  if (cartState.items.length === 0) return;
  loading.value = true;
  
  try {
    const subtotal = cartGetters.totalPrice.value;
    const envio = costoEnvio.value;
    const total = subtotal + envio;

    // Build address string
    const parts = [];
    if (form.calle) parts.push(`${form.calle} ${form.numExt} ${form.numInt ? 'Int. ' + form.numInt : ''}`.trim());
    if (form.colonia) parts.push(`Col. ${form.colonia}`);
    if (form.ciudad) parts.push(form.ciudad);
    if (form.estado) parts.push(form.estado);
    if (form.cp) parts.push(`C.P. ${form.cp}`);
    if (form.pais) parts.push(form.pais);
    const domicilio = parts.join(', ');

    const items = cartState.items.map(item => ({
      id: item.cartItemId,
      producto_id: item.id,
      nombre: item.name,
      variante: item.size,
      imagen: item.image,
      precio: item.price,
      cantidad: item.quantity
    }));

    const payload = {
      ...form,
      estado_env: form.estado,
      domicilio,
      items,
      subtotal,
      envio,
      total,
      paypalOrderId: paypalOrderData ? paypalOrderData.id : null,
      metodo_pago: 'PayPal'
    };

    const res = await fetch('/api/pedidos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error('Error al crear el pedido');

    alert('¡Pedido confirmado exitosamente!');
    cartActions.clearCart();
    router.push('/');
  } catch (error) {
    console.error(error);
    alert('Ocurrió un error al procesar el pedido. Intenta nuevamente.');
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.checkout-view {
  background-color: var(--secondary-color);
  min-height: 100vh;
  padding: 40px 20px;
}

.checkout-container {
  max-width: 1200px;
  margin: 0 auto;
}

.checkout-header {
  text-align: center;
  margin-bottom: 48px;
}

.checkout-header h1 {
  font-family: 'Jost', sans-serif;
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--text-main);
  margin-bottom: 8px;
}

.checkout-header p {
  font-family: 'Jost', sans-serif;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.checkout-content {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 40px;
}

.checkout-form-section,
.checkout-summary-section {
  background: var(--bg-color);
  padding: 40px;
  border-radius: 24px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.03);
}

h2 {
  font-family: 'Jost', sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 24px;
  color: var(--text-main);
}

.mt-4 { margin-top: 32px; }
.mt-3 { margin-top: 16px; }

.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: flex;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.form-group label {
  font-family: 'Jost', sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-main);
}

.form-input {
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-family: 'Jost', sans-serif;
  font-size: 1rem;
  transition: border-color 0.2s;
  outline: none;
  background: var(--bg-color);
  color: var(--text-main);
  width: 100%;
}

textarea.form-input {
  resize: vertical;
}

.form-input:focus {
  border-color: var(--primary-color);
}

/* Botón de mapa */
.btn-location {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.03);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 14px;
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 8px;
}

.btn-location:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.btn-location svg {
  stroke: currentColor;
}

/* Map Modal */
.map-modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.6);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.map-modal-content {
  background: var(--bg-color);
  width: 100%;
  max-width: 600px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
}

.map-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
}

.map-modal-header h3 {
  margin: 0;
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  color: var(--text-main);
}

.close-modal-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  color: var(--text-muted);
  cursor: pointer;
  line-height: 1;
}

.close-modal-btn:hover { color: var(--primary-color); }

.map-modal-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.map-hint {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0;
}

.map-container {
  height: 400px;
  width: 100%;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  background: var(--secondary-color);
}

.map-modal-footer {
  padding: 20px 24px;
  border-top: 1px solid var(--border-color);
  background: var(--secondary-color);
}

.confirm-location-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  width: 100%;
  transition: background 0.2s;
}

.confirm-location-btn:hover {
  background: #27272a;
}

/* Payment Methods */
.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.payment-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;
}

.payment-option:hover { background-color: var(--secondary-color); }
.payment-option:has(input:checked) {
  border-color: var(--primary-color);
  background-color: rgba(35, 118, 80, 0.05);
}

.payment-option span {
  font-family: 'Jost', sans-serif;
  font-weight: 600;
  color: var(--text-main);
}

.pay-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 20px;
  font-family: 'Jost', sans-serif;
  font-weight: 900;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

.pay-btn:hover {
  background: #27272a;
  transform: translateY(-2px);
}

.pay-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

/* Animations */
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.3s ease;
}
.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}

/* Summary */
.cart-items-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.summary-item {
  display: flex;
  gap: 16px;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.summary-item img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  background: var(--secondary-color);
}

.summary-item-info { flex: 1; }
.summary-item-info h4 {
  font-family: 'Jost', sans-serif;
  font-weight: 700;
  margin: 0 0 4px 0;
  font-size: 1rem;
}
.summary-item-info p {
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 4px 0;
}
.summary-item-price {
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  color: var(--primary-color);
}

.empty-summary {
  text-align: center;
  color: var(--text-muted);
  padding: 40px 0;
}

.summary-totals {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.total-row {
  display: flex;
  justify-content: space-between;
  font-family: 'Jost', sans-serif;
  color: var(--text-muted);
}

.grand-total {
  margin-top: 12px;
  padding-top: 16px;
  border-top: 2px solid var(--border-color);
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--text-main);
  font-family: 'Jost', sans-serif;
}

.btn-test-checkout {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px;
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  margin-top: 16px;
}

.btn-test-checkout:hover:not(:disabled) {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.btn-test-checkout:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .checkout-content { grid-template-columns: 1fr; }
  .checkout-summary-section { order: -1; }
}

@media (max-width: 600px) {
  .checkout-form-section,
  .checkout-summary-section { padding: 24px; }
  .form-row { flex-direction: column; gap: 20px; }
}

/* PayPal Hosted Card Fields Custom Form Styles */
.paypal-card-fields-section {
  border-top: 1px solid var(--border-color);
  padding-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.payment-method-subtitle {
  font-size: 0.95rem;
  color: var(--text-muted);
  margin-top: -16px;
  margin-bottom: 8px;
}

.card-form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* PayPal secure Hosted iframe input containers */
.hosted-field-container {
  height: 50px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0;
  overflow: hidden;
}

.hosted-field-container.focused {
  border-color: var(--primary-color);
}

.hosted-field-container.invalid {
  border-color: #ef4444;
}

/* Strip browser-default border from secure PayPal iframes */
.hosted-field-container :deep(iframe),
.hosted-field-container :deep(iframe:focus),
.hosted-field-container :deep(iframe:focus-visible) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  width: 100% !important;
  height: 100% !important;
}

.hosted-field-container:focus-within {
  outline: none !important;
  box-shadow: none !important;
}

.field-error {
  font-size: 0.8rem;
  color: #ef4444;
  margin-top: 4px;
  font-weight: 700;
  display: block;
}

/* Spinner */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>

<style>
/* Global reset to strip browser default borders from secure PayPal iframes */
.hosted-field-container iframe,
.hosted-field-container iframe:focus,
.hosted-field-container iframe:focus-visible {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  width: 100% !important;
  height: 100% !important;
}
</style>
