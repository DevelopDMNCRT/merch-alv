<script setup>
import { ref, onMounted } from 'vue'
import { useLocale } from '../composables/useLocale.js'
import { formatPrice } from '../store/locale.js'

const { t, tTag } = useLocale()

const encode = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

const stores = ref([])
const products = ref([])

// Newsletter
const nlNombre = ref('')
const nlCorreo = ref('')
const nlLoading = ref(false)
const nlMessage = ref(null)  // { type: 'success'|'error', text: '' }

async function submitNewsletter() {
  if (!nlNombre.value.trim() || !nlCorreo.value.trim()) return
  nlLoading.value = true
  nlMessage.value = null
  try {
    const res = await fetch('/api/suscriptores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nlNombre.value.trim(), correo: nlCorreo.value.trim() })
    })
    const data = await res.json()
    if (res.ok) {
      nlMessage.value = { type: 'success', text: t('home.newsletterSuccess') }
      nlNombre.value = ''
      nlCorreo.value = ''
    } else if (res.status === 400 && data.error && data.error.includes('registrado')) {
      nlMessage.value = { type: 'error', text: t('home.newsletterDuplicate') }
    } else {
      nlMessage.value = { type: 'error', text: t('home.newsletterError') }
    }
  } catch {
    nlMessage.value = { type: 'error', text: t('home.newsletterError') }
  } finally {
    nlLoading.value = false
  }
}

// Quote Modal
const showQuoteModal = ref(false)
const quoteForm = ref({
  nombre: '',
  telefono: '',
  servicio: ''
})
const quoteLoading = ref(false)
const quoteMessage = ref(null) // { type: 'success'|'error', text: '' }

async function submitQuote() {
  if (!quoteForm.value.nombre.trim() || !quoteForm.value.telefono.trim() || !quoteForm.value.servicio.trim()) return
  quoteLoading.value = true
  quoteMessage.value = null
  try {
    const res = await fetch('/api/quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: quoteForm.value.nombre.trim(),
        telefono: quoteForm.value.telefono.trim(),
        servicio: quoteForm.value.servicio.trim()
      })
    })
    const data = await res.json()
    if (res.ok) {
      quoteMessage.value = { type: 'success', text: '¡Cotización enviada con éxito! Te contactaremos pronto.' }
      quoteForm.value = { nombre: '', telefono: '', servicio: '' }
      setTimeout(() => {
        showQuoteModal.value = false
        quoteMessage.value = null
      }, 3000)
    } else {
      quoteMessage.value = { type: 'error', text: data.error || 'Hubo un error al enviar tu solicitud.' }
    }
  } catch (err) {
    quoteMessage.value = { type: 'error', text: 'Error de conexión. Por favor verifica tu red.' }
  } finally {
    quoteLoading.value = false
  }
}

onMounted(async () => {
  try {
    const resStores = await fetch('/api/tiendas')
    const dataStores = await resStores.json()
    console.log('Stores loaded:', dataStores)
    // Nos aseguramos de capturar tanto booleanos como strings "true" o 1
    stores.value = dataStores.filter(t => t.publico === true || t.publico === 'true' || t.publico === 1)
    console.log('Filtered stores:', stores.value)

    const resProducts = await fetch('/api/products')
    const dataProducts = await resProducts.json()
    // Mostrar solo algunos para "Lo más buscado"
    products.value = dataProducts.filter(p => p.es_publico).slice(0, 4)
  } catch (err) {
    console.error('Error fetching data:', err)
  }
})
</script>

<template>
  <main class="home-view">
    <section class="hero-redesign">
      <div class="hero-container">
        <!-- Left Column -->
        <div class="hero-content-left">
          <div class="hero-eyebrow">
            <span class="eyebrow-text">MERCH ALV</span>
            <span class="eyebrow-line"></span>
          </div>
          <h1 class="hero-title">
            PRODUCCIÓN,<br/>
            VENTA Y MANEJO<br/>
            DE <span class="text-red">MERCH OFICIAL.</span>
          </h1>
          <p class="hero-subtitle">
            Desarrollamos, producimos y distribuimos<br/>
            merch oficial para bandas, sellos y artistas.
          </p>
          <div class="hero-actions">
            <router-link to="/nosotros" class="btn-primary-red">CONOCE MÁS <span class="arrow">&rarr;</span></router-link>
            <router-link to="/tiendas" class="btn-outline-red">NUESTRAS TIENDAS</router-link>
          </div>
        </div>

        <!-- Right Column -->
        <div class="hero-visual-right">
          <img src="/images/hero-composition.png" alt="Merch ALV Composition" class="hero-composition-img" />
        </div>
      </div>
    </section>

    <!-- Servicios (Full Width) -->
    <section class="services-section">
      <div class="services-container">
        <!-- Playeras -->
        <div class="service-card">
          <div class="service-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" class="service-svg-icon">
              <path d="M30 22 C34 26, 66 26, 70 22 L86 36 L75 47 L68 41 L68 80 L32 80 L32 41 L25 47 L14 36 Z" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" fill="none" />
              <circle cx="50" cy="54" r="12" stroke="#ef4444" stroke-width="2" fill="none" />
              <circle cx="46" cy="51" r="1.2" fill="#ef4444" />
              <circle cx="54" cy="51" r="1.2" fill="#ef4444" />
              <path d="M45 56.5 C45 61, 55 61, 55 56.5" stroke="#ef4444" stroke-width="2" stroke-linecap="round" fill="none" />
            </svg>
          </div>
          <h3 class="service-title">{{ t('home.services.playerasTitle') }}</h3>
          <p class="service-desc">{{ t('home.services.playerasDesc') }}</p>
        </div>

        <!-- Serigrafía -->
        <div class="service-card">
          <div class="service-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" class="service-svg-icon">
              <rect x="24" y="16" width="52" height="64" rx="2" stroke="#ffffff" stroke-width="3" stroke-linejoin="round" fill="none" />
              <rect x="29" y="21" width="42" height="54" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round" fill="none" opacity="0.7" />
              <path d="M32 38 C32 38, 35 48, 40 45 C45 42, 50 48, 55 45 C60 42, 65 48, 68 38 L68 70 C60 70, 58 71, 56 75 L56 86 C56 90, 44 90, 44 86 L44 75 C42 71, 40 70, 32 70 Z" fill="#ef4444" />
              <path d="M33 26 L67 26 L65 36 L35 36 Z" stroke="#ffffff" stroke-width="2" fill="none" stroke-linejoin="round" />
              <line x1="34" y1="31" x2="66" y2="31" stroke="#ffffff" stroke-width="1.5" />
              <rect x="37" y="36" width="26" height="3" fill="#ffffff" />
            </svg>
          </div>
          <h3 class="service-title">{{ t('home.services.serigrafiaTitle') }}</h3>
          <p class="service-desc">{{ t('home.services.serigrafiaDesc') }}</p>
        </div>

        <!-- Pósters -->
        <div class="service-card">
          <div class="service-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" class="service-svg-icon">
              <path d="M26 16 L62 16 L74 28 L74 84 L26 84 Z" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" fill="none" />
              <path d="M62 16 L62 28 L74 28" stroke="#ffffff" stroke-width="2" stroke-linejoin="round" fill="none" />
              <path d="M31 22 L59 22" stroke="#ffffff" stroke-width="1" opacity="0.5" />
              <path d="M31 22 L31 78 L69 78 L69 32" stroke="#ffffff" stroke-width="1" opacity="0.5" />
              <path d="M53 30 L36 54 L48 54 L44 74 L63 48 L50 48 Z" fill="#ef4444" stroke="#ef4444" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" />
            </svg>
          </div>
          <h3 class="service-title">{{ t('home.services.postersTitle') }}</h3>
          <p class="service-desc">{{ t('home.services.postersDesc') }}</p>
        </div>

        <!-- Viniles -->
        <div class="service-card">
          <div class="service-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" class="service-svg-icon">
              <path d="M20 16 L20 36 A 14 14 0 0 1 20 64 L20 84" stroke="#ffffff" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.6" />
              <circle cx="56" cy="50" r="34" stroke="#ffffff" stroke-width="2.5" fill="none" />
              <circle cx="56" cy="50" r="28" stroke="#ffffff" stroke-width="1" stroke-dasharray="10 4 6 4" fill="none" opacity="0.4" />
              <circle cx="56" cy="50" r="22" stroke="#ffffff" stroke-width="1" stroke-dasharray="4 4 12 4" fill="none" opacity="0.4" />
              <circle cx="56" cy="50" r="16" stroke="#ffffff" stroke-width="1" stroke-dasharray="8 4" fill="none" opacity="0.3" />
              <circle cx="56" cy="50" r="10" fill="#ef4444" />
              <circle cx="56" cy="50" r="2.5" fill="#070707" />
            </svg>
          </div>
          <h3 class="service-title">{{ t('home.services.vinilesTitle') }}</h3>
          <p class="service-desc">{{ t('home.services.vinilesDesc') }}</p>
        </div>

        <!-- Y Más -->
        <div class="service-card">
          <div class="service-icon-wrapper">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" class="service-svg-icon">
              <path d="M26 34 L74 34 L78 84 L22 84 Z" stroke="#ffffff" stroke-width="2.5" stroke-linejoin="round" fill="none" />
              <path d="M38 34 C38 18, 62 18, 62 34" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none" />
              <circle cx="50" cy="58" r="11" stroke="#ef4444" stroke-width="2" fill="none" />
              <circle cx="46" cy="55.5" r="1.2" fill="#ef4444" />
              <circle cx="54" cy="55.5" r="1.2" fill="#ef4444" />
              <path d="M45 61 C45 65.5, 55 65.5, 55 61" stroke="#ef4444" stroke-width="2" stroke-linecap="round" fill="none" />
            </svg>
          </div>
          <h3 class="service-title">{{ t('home.services.ymasTitle') }}</h3>
          <p class="service-desc">{{ t('home.services.ymasDesc') }}</p>
        </div>
      </div>
    </section>

    <!-- Catálogo de Tiendas -->
    <section class="catalog-section">
      <div class="container catalog-container">
        <h2 class="section-title">{{ t('home.ourStores') }}</h2>
        <div class="artist-grid">
          <router-link :to="`/tienda/${encode(store.nombre)}`" class="artist-card" v-for="store in stores" :key="store.id">
            <div class="artist-image-wrapper">
              <img :src="store.imagen_url || '/images/artist1.png'" :alt="store.nombre" class="artist-image" loading="lazy">
            </div>
            <h3 class="artist-name">{{ store.nombre }}</h3>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="newsletter-section">
      <div class="newsletter-container">
        <div class="newsletter-row">
          <!-- Left Column: Info (Title & Description) -->
          <div class="newsletter-info-col">
            <h2 class="newsletter-title">{{ t('home.newsletterTitle') }}</h2>
            <p class="newsletter-sub">{{ t('home.newsletterDesc') }}</p>
          </div>

          <!-- Right Column: Registration (Form) -->
          <div class="newsletter-form-col">
            <form class="newsletter-form" @submit.prevent="submitNewsletter">
              <!-- Name input -->
              <div class="nl-fields">
                <div class="input-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <input
                    id="nl-nombre"
                    v-model="nlNombre"
                    type="text"
                    class="newsletter-input"
                    :placeholder="t('home.newsletterNamePlaceholder')"
                    :aria-label="t('home.newsletterNameLabel')"
                    required
                  />
                </div>
                <!-- Email input -->
                <div class="input-wrapper">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="input-icon">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <input
                    id="nl-correo"
                    v-model="nlCorreo"
                    type="email"
                    class="newsletter-input"
                    :placeholder="t('home.newsletterPlaceholder')"
                    :aria-label="t('home.newsletterPlaceholder')"
                    required
                  />
                </div>
              </div>
              <button type="submit" class="newsletter-btn" :disabled="nlLoading">
                <span v-if="nlLoading">...</span>
                <span v-else>{{ t('home.newsletterBtn') }}</span>
              </button>
            </form>
            <!-- Feedback message -->
            <transition name="nl-fade">
              <p v-if="nlMessage" :class="['newsletter-msg', nlMessage.type === 'success' ? 'nl-success' : 'nl-error']">
                {{ nlMessage.text }}
              </p>
            </transition>
            <p class="newsletter-disclaimer">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              {{ t('home.newsletterDisclaimer') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Lo más buscado -->
    <section class="bestsellers-section">
      <div class="bestsellers-container">
        <div class="section-header">
          <span class="section-eyebrow">{{ t('home.trendEyebrow') }}</span>
          <h2 class="bestsellers-title">{{ t('home.bestsellers') }}</h2>
          <p class="bestsellers-sub">{{ t('home.bestsellersDesc') }}</p>
        </div>
        <div class="products-grid">
          <router-link :to="`/producto/${product.slug || product.id}`" class="product-card" v-for="product in products" :key="product.id">
            <div class="product-image-wrapper">
              <div v-if="!product.imagen_url" class="product-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="placeholder-icon">
                  <path d="M7 2L2 5V10H5V21H19V10H22V5L17 2H14C14 3.1 13.1 4 12 4C10.9 4 10 3.1 10 2H7Z" />
                </svg>
              </div>
              <img v-else :src="product.imagen_url" :alt="product.nombre" class="product-image" loading="lazy">
              <span class="product-tag" v-if="product.flag">{{ product.flag }}</span>
              <span class="discount-badge" v-if="product.descuento > 0">-{{ product.descuento }}%</span>
              <div class="product-overlay">
                <button class="overlay-btn">{{ t('home.viewProduct') }}</button>
              </div>
            </div>
            <div class="product-info">
              <span class="product-artist">{{ product.tienda }}</span>
              <h3 class="product-name">{{ product.nombre }}</h3>
              <div class="product-footer">
                <template v-if="product.descuento > 0">
                  <div class="price-discount-box">
                    <span class="product-price price-discounted">${{ (Number(product.precio || 0) * (1 - product.descuento / 100)).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} MXN</span>
                    <span class="price-original-strike">${{ Number(product.precio || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} MXN</span>
                  </div>
                </template>
                <template v-else>
                  <span class="product-price">{{ formatPrice(product.precio) }}</span>
                </template>
              </div>


            </div>
          </router-link>

        </div>
      </div>
    </section>

    <!-- Banner Maquila -->
    <section class="maquila-banner">
      <div class="maquila-container">
        <div class="maquila-left-col">
          <span class="maquila-eyebrow">{{ t('home.servicesEyebrow') }}</span>
          <h2 class="maquila-title">{{ t('home.maquilaTitle') }}</h2>
          <p class="maquila-desc">{{ t('home.maquilaDesc') }}</p>
        </div>
        <div class="maquila-right-col">
          <button class="maquila-btn" @click="showQuoteModal = true">{{ t('home.maquilaBtn') }}</button>
        </div>
      </div>
    </section>

    <!-- Contacto -->
    <section class="contact-section">
      <div class="contact-container">
        <div class="contact-header">
          <span class="section-eyebrow">{{ t('home.contactEyebrow') }}</span>
          <h2 class="section-title" style="margin-bottom: 16px;">{{ t('home.contactTitle') }}</h2>
          <p class="contact-sub">{{ t('home.contactDesc') }}</p>
        </div>
        
        <div class="contact-content-stacked">
          <!-- Formulario -->
          <div class="contact-form-card">
            <form class="contact-form" @submit.prevent>
              <div class="form-group">
                <label for="name">{{ t('home.contactName') }}</label>
                <input type="text" id="name" :placeholder="t('home.contactNamePh')" required>
              </div>

              <div class="form-group">
                <label for="email">{{ t('home.contactEmail') }}</label>
                <input type="email" id="email" :placeholder="t('home.contactEmailPh')" required>
              </div>

              <div class="form-group">
                <label for="subject">{{ t('home.contactSubject') }}</label>
                <select id="subject" required>
                  <option value="" disabled selected>{{ t('home.contactSubjectPh') }}</option>
                  <option value="pedido">{{ t('home.contactOrder') }}</option>
                  <option value="maquila">{{ t('home.contactMaquila') }}</option>
                  <option value="otro">{{ t('home.contactOther') }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="message">{{ t('home.contactMessage') }}</label>
                <textarea id="message" rows="4" :placeholder="t('home.contactMessagePh')" required></textarea>
              </div>

              <button type="submit" class="submit-btn">{{ t('home.contactSend') }}</button>
            </form>
          </div>

          <!-- Info de Contacto -->
          <div class="contact-info-card">
            <div class="info-item">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div class="info-text">
                <h3>{{ t('home.contactPhone') }}</h3>
                <p><a href="tel:+525512345678">+52 55 1234 5678</a></p>
              </div>
            </div>
            
            <div class="info-item">
              <div class="info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div class="info-text">
                <h3>{{ t('home.contactEmailLabel') }}</h3>
                <p><a href="mailto:hola@merchalv.mx">hola@merchalv.mx</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modal Cotización -->
    <transition name="fade-modal">
      <div v-if="showQuoteModal" class="quote-modal-overlay" @click.self="showQuoteModal = false">
        <div class="quote-modal-content">
          <div class="quote-modal-header">
            <h2>Cotizar Proyecto</h2>
            <button @click="showQuoteModal = false" class="close-modal-btn" aria-label="Cerrar">&times;</button>
          </div>
          
          <div class="quote-modal-body">
            <div v-if="quoteMessage" :class="['quote-alert', `alert-${quoteMessage.type}`]">
              {{ quoteMessage.text }}
            </div>
            
            <form v-if="!quoteMessage || quoteMessage.type !== 'success'" @submit.prevent="submitQuote" class="quote-form">
              <div class="form-group">
                <label for="quote-name">Nombre</label>
                <input 
                  type="text" 
                  id="quote-name" 
                  v-model="quoteForm.nombre" 
                  placeholder="Ingresa tu nombre completo" 
                  required
                  :disabled="quoteLoading"
                />
              </div>
              
              <div class="form-group">
                <label for="quote-phone">Teléfono</label>
                <input 
                  type="tel" 
                  id="quote-phone" 
                  v-model="quoteForm.telefono" 
                  placeholder="Ej. +52 55 1234 5678" 
                  required
                  :disabled="quoteLoading"
                />
              </div>
              
              <div class="form-group">
                <label for="quote-service">Servicio a cotizar</label>
                <textarea 
                  id="quote-service" 
                  v-model="quoteForm.servicio" 
                  rows="3"
                  placeholder="Describe tu proyecto (ej. 100 Sudaderas negras con bordado en pecho)" 
                  required
                  :disabled="quoteLoading"
                ></textarea>
              </div>
              
              <button type="submit" class="quote-submit-btn" :disabled="quoteLoading">
                <span v-if="!quoteLoading">Enviar Solicitud</span>
                <span v-else class="quote-spinner"></span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </transition>
  </main>
</template>

<style scoped>
.home-view {
  display: flex;
  flex-direction: column;
}
/* Hero Redesign Styles */
.hero-redesign {
  position: relative;
  background-color: #050505;
  background-image: radial-gradient(circle at 50% 50%, #111 0%, #000 100%);
  color: white;
  min-height: calc(100vh - 70px);
  min-height: calc(100dvh - 70px);
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 50px 0;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 40px;
  position: relative;
  z-index: 2;
}

.hero-content-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-right: 40px;
}

.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.eyebrow-text {
  font-family: 'Jost', sans-serif;
  color: #ef4444;
  font-weight: 800;
  letter-spacing: 2px;
  font-size: 1rem;
}

.eyebrow-line {
  height: 2px;
  background-color: #ef4444;
  flex: 0 0 100px;
}

.hero-title {
  font-family: 'Jost', sans-serif;
  font-size: 4.5rem;
  font-weight: 900;
  line-height: 1.05;
  text-transform: uppercase;
  margin-bottom: 32px;
  letter-spacing: -1px;
  position: relative;
}

.text-red {
  color: #ef4444;
}



.hero-subtitle {
  font-size: 1.25rem;
  color: #d4d4d8;
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.btn-primary-red {
  background-color: #ef4444;
  color: white;
  padding: 16px 32px;
  border-radius: 4px;
  font-weight: 800;
  font-size: 1rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-primary-red:hover {
  background-color: #dc2626;
}

.btn-outline-red {
  background-color: transparent;
  color: white;
  border: 1px solid #ef4444;
  padding: 16px 32px;
  border-radius: 4px;
  font-weight: 800;
  font-size: 1rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: background-color 0.3s;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-outline-red:hover {
  background-color: rgba(239, 68, 68, 0.1);
}

.hero-visual-right {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-composition-img {
  width: 110%;
  max-width: 110%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 20px 30px rgba(0,0,0,0.5));
  mask-image: radial-gradient(circle at center, black 50%, transparent 95%);
  -webkit-mask-image: radial-gradient(circle at center, black 50%, transparent 95%);
}



@media (max-width: 1200px) {
  .hero-title { font-size: 3.5rem; }
  .hero-composition-img { width: 100%; max-width: 100%; }
}

@media (max-width: 1024px) {
  .hero-redesign {
    padding: 30px 0;
  }
  .hero-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100%;
    position: relative;
    padding: 0 24px;
  }
  .hero-content-left {
    padding-right: 0;
    align-items: center;
    z-index: 3;
  }
  .hero-visual-right {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    height: 100%;
    opacity: 0.15;
    pointer-events: none;
    z-index: 1;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .hero-composition-img {
    max-width: 85%;
    max-height: 85%;
    object-fit: contain;
  }
  .hero-eyebrow {
    justify-content: center;
  }
  .eyebrow-line { display: none; }
  .hero-title { font-size: 3rem; }
  .hero-subtitle { margin-left: auto; margin-right: auto; }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }
  .hero-actions { flex-direction: column; width: 100%; max-width: 300px; margin: 0 auto; }
  .btn-primary-red, .btn-outline-red { width: 100%; justify-content: center; }
}


/* Catálogo Styles */
.catalog-section {
  padding: 80px 0;
  background-color: var(--bg-color);
  position: relative;
  overflow: hidden;
}

.catalog-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.section-title {
  font-family: 'Jost', sans-serif;
  text-align: center;
  font-size: 2.8rem;
  font-weight: 900;
  margin-bottom: 48px;
  color: var(--primary-color);
}

.artist-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 Columnas */
  gap: 40px 32px;
}

.artist-card {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: transform 0.3s ease;
  text-decoration: none;
  color: inherit;
}

.artist-card:hover {
  transform: translateY(-8px);
}

.artist-card:hover .artist-image {
  transform: scale(1.05);
}

.artist-image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 50%;
  margin-bottom: 20px;
  background-color: var(--secondary-color);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  border: 4px solid white;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s ease;
}

.artist-card:hover .artist-image-wrapper {
  box-shadow: 0 16px 32px rgba(0,0,0,0.12);
}

.artist-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.artist-name {
  font-size: 1.2rem;
  font-weight: 700;
  text-align: center;
  color: var(--text-main);
  transition: color 0.2s;
}

.artist-card:hover .artist-name {
  color: var(--primary-color);
}

@media (max-width: 900px) {
  .artist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .artist-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

/* Services Section (Full Width) */
.services-section {
  background-color: #070707;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  width: 100%;
  padding: 60px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.services-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  width: 100%;
  padding: 0 40px;
  max-width: 100%;
}

.service-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 30px;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.service-card:last-child {
  border-right: none;
}

.service-icon-wrapper {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.service-svg-icon {
  width: 100%;
  height: 100%;
  transition: filter 0.3s ease;
}

.service-title {
  font-family: 'Jost', sans-serif;
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #ffffff;
  margin-bottom: 12px;
  transition: color 0.3s ease;
}

.service-desc {
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  font-weight: 400;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.6);
  max-width: 240px;
  margin: 0;
  transition: color 0.3s ease;
}

/* Hover effects */
.service-card:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.service-card:hover .service-icon-wrapper {
  transform: translateY(-6px) scale(1.06);
}

.service-card:hover .service-svg-icon {
  filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.5));
}

.service-card:hover .service-title {
  color: #ef4444;
}

.service-card:hover .service-desc {
  color: rgba(255, 255, 255, 0.85);
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .services-container {
    grid-template-columns: repeat(3, 1fr);
    row-gap: 40px;
  }
  .service-card {
    border-right: 1px solid rgba(255, 255, 255, 0.08);
  }
  /* Remove right border on 3rd elements */
  .service-card:nth-child(3n) {
    border-right: none;
  }
  /* On tablet the 4th & 5th items can be in a row of 2: let's center them or span them nicely */
  .service-card:nth-child(4) {
    grid-column: 2 / 3;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
  }
  .service-card:nth-child(5) {
    grid-column: 3 / 4;
    border-right: none;
  }
}

@media (max-width: 768px) {
  .services-section {
    padding: 50px 0;
  }
  .services-container {
    grid-template-columns: repeat(2, 1fr);
    row-gap: 30px;
  }
  .service-card {
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    padding: 15px 20px;
  }
  .service-card:nth-child(2n) {
    border-right: none;
  }
  .service-card:nth-child(3n) {
    border-right: 1px solid rgba(255, 255, 255, 0.08);
  }
  /* Reset grid columns for 4th and 5th items */
  .service-card:nth-child(4) {
    grid-column: auto;
  }
  .service-card:nth-child(5) {
    grid-column: 1 / 3;
    border-right: none;
    max-width: 100%;
  }
  .service-card:nth-child(5) .service-desc {
    max-width: 320px;
  }
}

@media (max-width: 480px) {
  .services-container {
    grid-template-columns: 1fr;
    row-gap: 20px;
    padding: 0 10px;
  }
  .service-card {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 25px 15px;
  }
  .service-card:last-child {
    border-bottom: none;
  }
  .service-card:nth-child(5) {
    grid-column: auto;
  }
}

/* Lo más buscado */
.bestsellers-section {
  padding: 100px 0;
  background-color: var(--bg-color);
  position: relative;
  overflow: hidden;
}

.bestsellers-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-eyebrow {
  font-family: 'Jost', sans-serif;
  display: inline-block;
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--accent-red);
  margin-bottom: 16px;
}

.bestsellers-title {
  font-family: 'Jost', sans-serif;
  font-size: 2.8rem;
  font-weight: 900;
  color: var(--primary-color);
  line-height: 1.1;
  margin-bottom: 16px;
}

.bestsellers-sub {
  font-family: 'Jost', sans-serif;
  font-size: 1.15rem;
  color: var(--text-muted);
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
}

/* Product Card */
.product-card {
  display: flex;
  flex-direction: column;
  border-radius: 24px;
  overflow: hidden;
  background: var(--bg-color);
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
  transition: box-shadow 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), background-color 0.1s, color 0.1s;
  border: 1px solid rgba(0,0,0,0.03);
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}

.product-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 48px rgba(0,0,0,0.1);
}

.product-image-wrapper {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: var(--secondary-color);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
}

.product-placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbbbbb;
}

.placeholder-icon {
  width: 60px;
  height: 60px;
  opacity: 0.5;
}

.product-card:hover .product-image {
  transform: scale(1.08);
}

.product-tag {
  position: absolute;
  top: 20px;
  left: 20px;
  font-family: 'Jost', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--text-main);
  color: var(--bg-color);
  padding: 6px 14px;
  border-radius: 20px;
  z-index: 2;
}

.discount-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  font-family: 'Jost', sans-serif;
  font-size: 0.75rem;
  font-weight: 800;
  background: var(--accent-red, #ef4444);
  color: #ffffff;
  padding: 5px 11px;
  border-radius: 14px;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.price-discount-box {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.price-discounted {
  color: #dc2626 !important;
  font-weight: 800;
  font-size: 1.25rem;
  line-height: 1.1;
}

.price-original-strike {
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  color: #9ca3af;
  text-decoration: line-through !important;
  line-height: 1;
}



.product-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.4s ease;
  backdrop-filter: blur(2px);
  z-index: 1;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

.overlay-btn {
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  color: white;
  border: 2px solid white;
  padding: 14px 32px;
  border-radius: 100px;
  transition: background 0.3s, color 0.3s, transform 0.3s;
  letter-spacing: 0.5px;
  transform: translateY(20px);
}

.product-card:hover .overlay-btn {
  transform: translateY(0);
}

.overlay-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.product-info {
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-artist {
  font-family: 'Jost', sans-serif;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--primary-color);
  margin-bottom: 8px;
}

.product-name {
  font-family: 'Jost', sans-serif;
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-main);
  line-height: 1.3;
  margin-bottom: 16px;
  transition: color 0.2s;
}

.product-card:hover .product-name {
  color: var(--primary-color);
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  border-top: 1px solid rgba(0,0,0,0.06);
  padding-top: 20px;
}

.product-price {
  font-family: 'Jost', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-main);
}

.add-to-cart-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.add-to-cart-btn:hover {
  background-color: #27272a;
  transform: scale(1.15) rotate(5deg);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
}

@media (max-width: 900px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .products-grid {
    grid-template-columns: 1fr;
  }
  .bestsellers-title {
    font-size: 2.4rem;
  }
}

/* Newsletter */
.newsletter-section {
  background-color: var(--secondary-color);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 80px 20px;
  position: relative;
  overflow: hidden;
  transition: background-color 0.3s, border-color 0.3s;
}

.newsletter-section::before,
.newsletter-section::after {
  display: none;
}

.newsletter-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  padding: 0 40px;
}

.newsletter-row {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 80px;
  align-items: center;
}

.newsletter-title {
  font-family: 'Jost', sans-serif;
  font-size: 2.8rem;
  font-weight: 900;
  color: var(--text-main);
  line-height: 1.1;
  margin-bottom: 20px;
  transition: color 0.3s;
}

.newsletter-sub {
  font-family: 'Jost', sans-serif;
  font-size: 1.1rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 32px;
  max-width: 520px;
  transition: color 0.3s;
}

.newsletter-form-col {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.newsletter-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 520px;
  margin: 0 0 20px;
}

.nl-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
  pointer-events: none;
  flex-shrink: 0;
  transition: color 0.3s;
}

.newsletter-input {
  width: 100%;
  font-family: 'Jost', sans-serif;
  font-size: 1rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  color: var(--text-main);
  border-radius: 12px;
  padding: 14px 16px 14px 48px;
  outline: none;
  transition: border-color 0.3s, background 0.3s, box-shadow 0.3s, color 0.3s;
}

.newsletter-input::placeholder {
  color: var(--text-muted);
  transition: color 0.3s;
}

.newsletter-input:focus {
  border-color: var(--accent-red);
  background: var(--bg-color);
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.08);
}

.newsletter-btn {
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  padding: 14px 28px;
  background-color: var(--primary-color);
  color: var(--button-text);
  border-radius: 12px;
  white-space: nowrap;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  width: 100%;
  border: none;
  cursor: pointer;
}

.newsletter-btn:not(:disabled):hover {
  background-color: var(--accent-red);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3);
}

.newsletter-btn:not(:disabled):active {
  transform: translateY(0);
}

.newsletter-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.newsletter-disclaimer {
  font-family: 'Jost', sans-serif;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--text-muted);
  text-align: left;
  transition: color 0.3s;
}

.newsletter-disclaimer svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: var(--text-muted);
  transition: color 0.3s;
}

.newsletter-msg {
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: left;
  margin: 0 0 16px;
  padding: 10px 20px;
  border-radius: 10px;
  width: 100%;
  max-width: 520px;
}

.nl-success {
  background: rgba(16, 185, 129, 0.1);
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

:global(html.dark) .nl-success {
  color: #34d399;
}

.nl-error {
  background: rgba(239, 68, 68, 0.08);
  color: #991b1b;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

:global(html.dark) .nl-error {
  color: #f87171;
}

.nl-fade-enter-active, .nl-fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.nl-fade-enter-from, .nl-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 1024px) {
  .newsletter-container {
    padding: 0 24px;
  }
  .newsletter-row {
    grid-template-columns: 1fr;
    gap: 48px;
    text-align: center;
  }
  .newsletter-info-col {
    align-items: center;
    text-align: center;
  }
  .newsletter-sub {
    text-align: center;
    max-width: 600px;
    margin-bottom: 24px;
  }
  .newsletter-form {
    max-width: 520px;
    margin: 0 auto 20px;
  }
  .newsletter-msg {
    text-align: center;
    max-width: 520px;
    margin: 0 auto 16px;
  }
  .newsletter-disclaimer {
    justify-content: center;
    text-align: center;
    max-width: 520px;
    margin: 0 auto;
  }
}

@media (max-width: 600px) {
  .newsletter-section {
    padding: 60px 20px;
  }
  .newsletter-title {
    font-size: 2.2rem;
  }
}


/* Banner Maquila */
.maquila-banner {
  position: relative;
  min-height: 380px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background-color: var(--secondary-color);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  transition: border-color 0.3s, background-color 0.3s;
}

.maquila-container {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 80px 40px;
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 60px;
  align-items: center;
  position: relative;
  z-index: 2;
}

.maquila-left-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.maquila-right-col {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.maquila-eyebrow {
  font-family: 'Jost', sans-serif;
  display: block;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: var(--accent-red);
  margin-bottom: 16px;
}

.maquila-title {
  font-family: 'Jost', sans-serif;
  font-size: 2.8rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 16px;
  color: var(--text-main);
  transition: color 0.3s;
}

.maquila-desc {
  font-family: 'Jost', sans-serif;
  font-size: 1.15rem;
  line-height: 1.6;
  color: var(--text-muted);
  max-width: 680px;
  margin: 0;
  transition: color 0.3s;
}

.maquila-btn {
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  font-size: 1.1rem;
  padding: 16px 48px;
  background-color: var(--primary-color);
  color: var(--button-text);
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  white-space: nowrap;
}

.maquila-btn:hover {
  background-color: var(--accent-red);
  color: white;
  transform: translateY(-4px);
  box-shadow: 0 10px 32px rgba(239, 68, 68, 0.3);
}

.maquila-btn:active {
  transform: translateY(0);
}

@media (max-width: 1024px) {
  .maquila-container {
    grid-template-columns: 1fr;
    gap: 40px;
    text-align: center;
    padding: 60px 24px;
  }
  .maquila-left-col {
    align-items: center;
    text-align: center;
  }
  .maquila-right-col {
    justify-content: center;
  }
  .maquila-title {
    font-size: 2.5rem;
  }
  .maquila-desc {
    font-size: 1.1rem;
  }
}

/* Contact Section */
.contact-section {
  padding: 100px 0;
  background-color: var(--bg-color);
  position: relative;
}

.contact-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 40px;
}

.contact-header {
  text-align: center;
  margin-bottom: 56px;
}

.contact-sub {
  font-family: 'Jost', sans-serif;
  font-size: 1.15rem;
  color: var(--text-muted);
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.6;
}

.contact-content-stacked {
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: 760px;
  margin: 0 auto;
}

.contact-info-card {
  background: var(--bg-color);
  border-radius: 24px;
  padding: 32px 40px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  gap: 32px;
  border: 1px solid rgba(0,0,0,0.03);
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.info-icon {
  background-color: rgba(35, 118, 80, 0.1);
  color: var(--primary-color);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.info-text h3 {
  font-family: 'Jost', sans-serif;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 4px;
}

.info-text p, .info-text a {
  font-family: 'Jost', sans-serif;
  font-size: 1rem;
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
  margin: 0;
}

.info-text a:hover {
  color: var(--primary-color);
}

.contact-form-card {
  background: var(--bg-color);
  border-radius: 24px;
  padding: 40px 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.04);
  border: 1px solid rgba(0,0,0,0.03);
}



.contact-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--text-main);
}

.form-group input, 
.form-group select, 
.form-group textarea {
  font-family: 'Jost', sans-serif;
  font-size: 1rem;
  padding: 14px 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--secondary-color);
  color: var(--text-main);
  outline: none;
  transition: border-color 0.3s, background 0.3s;
}

.form-group input:focus, 
.form-group select:focus, 
.form-group textarea:focus {
  border-color: var(--primary-color);
  background: var(--bg-color);
}

.submit-btn {
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  font-size: 1.05rem;
  padding: 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.submit-btn:hover {
  background-color: #27272a;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.submit-btn:active {
  transform: translateY(0);
}

@media (max-width: 600px) {
  .contact-info-card,
  .contact-form-card {
    padding: 32px 24px;
  }
  .contact-info-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Quote Modal Styles */
.quote-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.quote-modal-content {
  background-color: var(--bg-color);
  color: var(--text-main);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modal-zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modal-zoom {
  from { transform: scale(0.9) translateY(10px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.quote-modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quote-modal-header h2 {
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  font-size: 1.4rem;
  margin: 0;
}

.close-modal-btn {
  font-size: 2rem;
  color: var(--text-muted);
  cursor: pointer;
  background: none;
  border: none;
  line-height: 1;
  transition: color 0.2s;
}

.close-modal-btn:hover {
  color: var(--primary-color);
}

.quote-modal-body {
  padding: 24px;
}

.quote-alert {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  margin-bottom: 20px;
  line-height: 1.4;
}

.alert-success {
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.alert-error {
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.quote-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quote-form .form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
}

.quote-form .form-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-main);
}

.quote-form .form-group input,
.quote-form .form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  background: var(--secondary-color);
  color: var(--text-main);
  outline: none;
  transition: border-color 0.3s, background 0.3s;
}

.quote-form .form-group input:focus,
.quote-form .form-group textarea:focus {
  border-color: var(--primary-color);
  background: var(--bg-color);
}

.quote-submit-btn {
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  padding: 14px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  margin-top: 8px;
  transition: background-color 0.2s, transform 0.1s;
  display: flex;
  justify-content: center;
  align-items: center;
}

.quote-submit-btn:hover {
  background-color: #27272a;
}

.quote-submit-btn:active {
  transform: scale(0.98);
}

.quote-submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quote-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.25s ease;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
</style>
