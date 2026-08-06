<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CartDrawer from './CartDrawer.vue'
import { cartActions, cartGetters } from '../store/cart.js'
import { useLocale } from '../composables/useLocale.js'
import { currentTheme, toggleTheme } from '../store/theme.js'

const isMenuOpen = ref(false)
const isSearchOpen = ref(false)
const isTiendasOpen = ref(false)
const isDesktopMegamenuOpen = ref(false)
const stores = ref([])

const searchQuery = ref('')
const searchResults = ref([])
const allProducts = ref([])
const searchInput = ref(null)

const route = useRoute()
const router = useRouter()

const encode = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

const fetchSearchProducts = async () => {
  if (allProducts.value.length === 0) {
    try {
      const res = await fetch('/api/products')
      if (res.ok) {
        allProducts.value = await res.json()
      }
    } catch (err) {
      console.error('Error fetching products for search:', err)
    }
  }
}

onMounted(async () => {
  try {
    const res = await fetch('/api/tiendas')
    const data = await res.json()
    // Filtrar solo las públicas
    stores.value = data.filter(t => t.publico === true || t.publico === 'true' || t.publico === 1)
  } catch (err) {
    console.error('Error fetching stores for megamenu:', err)
  }
})

const isCheckout = computed(() => route.path === '/checkout')
const { t } = useLocale()

watch(route, () => {
  isDesktopMegamenuOpen.value = false
})

const handleClickOutside = (e) => {
  if (isDesktopMegamenuOpen.value && !e.target.closest('.has-megamenu')) {
    isDesktopMegamenuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const toggleSearch = () => {
  isSearchOpen.value = !isSearchOpen.value
}

watch(isSearchOpen, (val) => {
  if (val) {
    fetchSearchProducts()
    searchQuery.value = ''
    searchResults.value = []
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
})

watch(searchQuery, (q) => {
  if (!q || !q.trim()) {
    searchResults.value = []
    return
  }
  const queryLower = q.toLowerCase().trim()
  searchResults.value = allProducts.value.filter(p => {
    const matchName = p.nombre && p.nombre.toLowerCase().includes(queryLower)
    const matchStore = p.tienda && p.tienda.toLowerCase().includes(queryLower)
    const matchDesc = p.descripcion && p.descripcion.toLowerCase().includes(queryLower)
    return matchName || matchStore || matchDesc
  }).slice(0, 6)
})

const selectProduct = (slug) => {
  isSearchOpen.value = false
  router.push(`/producto/${slug}`)
}

const handleSearchSubmit = () => {
  if (searchResults.value.length > 0) {
    selectProduct(searchResults.value[0].slug)
  }
}

</script>

<template>
  <header class="site-header">
    <div class="header-container">
      <div class="logo-container">
        <router-link to="/" class="site-logo-link">
          <img v-if="currentTheme === 'light'" src="/logo-light-01.png" alt="Merch ALV" class="logo" />
          <img v-else src="/logo-dark-01.png" alt="Merch ALV" class="logo" />
        </router-link>
      </div>

      <!-- Desktop Navigation -->
      <nav class="desktop-nav">
        <ul class="desktop-nav-links">
          <li><router-link to="/">{{ t('nav.home') }}</router-link></li>
          <li class="has-megamenu" :class="{ 'is-active': isDesktopMegamenuOpen }">
            <a href="#" @click.prevent="isDesktopMegamenuOpen = !isDesktopMegamenuOpen" class="megamenu-trigger">{{ t('nav.stores') }} <span class="chevron"></span></a>
            <div class="megamenu">
              <div class="megamenu-inner">
                <div class="megamenu-info">
                  <h3 class="megamenu-title">{{ t('nav.artistsAndStores') }}</h3>
                  <p class="megamenu-desc">{{ t('nav.megamenuDesc') }}</p>
                  <router-link to="/tiendas" class="megamenu-btn">{{ t('nav.allStores') }}</router-link>
                </div>
                <div class="megamenu-lists">
                  <ul class="sub-menu">
                    <li class="menu-item" v-for="store in stores" :key="store.id">
                      <router-link :to="`/tienda/${encode(store.nombre)}`">{{ store.nombre }}</router-link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </li>
          <li><router-link to="/nosotros">{{ t('nav.about') }}</router-link></li>
          <li><router-link to="/rastreo">{{ t('nav.tracking') }}</router-link></li>
          <li><router-link to="/contacto">{{ t('nav.contact') }}</router-link></li>
        </ul>
      </nav>

      <div class="header-actions">
        <!-- Buscador -->
        <div class="search-container">
          <button @click="toggleSearch" class="icon-btn" aria-label="Buscar">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        <!-- Switch de Tema -->
        <button @click="toggleTheme" class="icon-btn theme-switch-btn" :aria-label="currentTheme === 'light' ? 'Modo Oscuro' : 'Modo Claro'">
          <svg v-if="currentTheme === 'light'" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        </button>

        <!-- Menu Hamburguesa (Mobile) -->
        <button @click="toggleMenu" class="hamburger-btn icon-btn" aria-label="Menu">
          <svg v-if="!isMenuOpen" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Navigation Drawer -->
    <nav class="mobile-nav" :class="{ 'nav-open': isMenuOpen }">
      <ul class="nav-links">
        <li><router-link to="/" @click="toggleMenu">{{ t('nav.home') }}</router-link></li>
        <li>
          <div class="mobile-submenu-toggle" @click="isTiendasOpen = !isTiendasOpen">
            {{ t('nav.stores') }}
            <span class="chevron" :style="{ transform: isTiendasOpen ? 'rotate(180deg)' : 'rotate(0)' }"></span>
          </div>
          <ul class="mobile-sub-menu" v-show="isTiendasOpen">
            <li class="menu-item" v-for="store in stores" :key="store.id">
              <router-link :to="`/tienda/${encode(store.nombre)}`" @click="toggleMenu">{{ store.nombre }}</router-link>
            </li>
          </ul>
        </li>
        <li><router-link to="/nosotros" @click="toggleMenu">{{ t('nav.about') }}</router-link></li>
        <li><router-link to="/rastreo" @click="toggleMenu">{{ t('nav.tracking') }}</router-link></li>
        <li><router-link to="/contacto" @click="toggleMenu">{{ t('nav.contact') }}</router-link></li>
      </ul>
    </nav>
  </header>

  <!-- Botón Flotante WhatsApp -->
  <a href="https://wa.me/525568786938" target="_blank" rel="noopener noreferrer" class="floating-whatsapp" aria-label="Escribenos por WhatsApp">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"></path>
    </svg>
    <span class="whatsapp-text">Escríbenos</span>
  </a>

  <!-- Carrito Flotante -->
  <button v-if="!isCheckout" class="floating-cart" aria-label="Carrito" @click="cartActions.openCart()">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="9" cy="21" r="1"></circle>
      <circle cx="20" cy="21" r="1"></circle>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
    </svg>
    <span class="cart-badge">{{ cartGetters.totalItems.value }}</span>
  </button>

  <CartDrawer />

  <!-- Fullscreen Search Overlay -->
  <transition name="fade-search">
    <div v-if="isSearchOpen" class="search-overlay">
      <button @click="toggleSearch" class="close-search" aria-label="Cerrar Búsqueda">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div class="search-overlay-inner">
        <input 
          type="text" 
          v-model="searchQuery"
          class="search-fullscreen-input" 
          :placeholder="t('nav.searchPlaceholder')"
          ref="searchInput" 
          @keyup.esc="toggleSearch"
          @keyup.enter="handleSearchSubmit"
        />
        <p class="search-hint">{{ t('nav.searchHint') }}</p>

        <!-- Resultados / Sugerencias de Búsqueda -->
        <div v-if="searchQuery.trim()" class="search-results-container">
          <div v-if="searchResults.length > 0" class="search-results-grid">
            <div 
              v-for="prod in searchResults" 
              :key="prod.id" 
              class="search-result-card"
              @click="selectProduct(prod.slug)"
            >
              <div class="result-img-wrapper">
                <img :src="prod.imagen_url || '/placeholder.png'" :alt="prod.nombre" class="result-img" />
              </div>
              <div class="result-info">
                <span v-if="prod.tienda && prod.tienda !== 'General'" class="result-store-tag">{{ prod.tienda }}</span>
                <h4 class="result-title">{{ prod.nombre }}</h4>
                <span class="result-price">${{ Number(prod.precio || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="search-no-results">
            <p>No se encontraron productos para "<strong>{{ searchQuery }}</strong>"</p>
          </div>
        </div>
      </div>

    </div>
  </transition>
</template>

<style scoped>
.site-header {
  background-color: var(--bg-color);
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.logo-container {
  display: flex;
  align-items: center;
}

.site-logo-link {
  display: flex;
  align-items: center;
  text-decoration: none;
}

.logo {
  height: 48px;
  width: auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-main);
  padding: 4px;
}

.search-container {
  display: flex;
  align-items: center;
  position: relative;
}

/* Buscador Overlay Styles */
.search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.98);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.close-search {
  position: absolute;
  top: 40px;
  right: 40px;
  color: var(--text-main);
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.2s, color 0.2s;
}

.close-search:hover {
  transform: scale(1.1);
  color: var(--primary-color);
}

.search-overlay-inner {
  width: 100%;
  max-width: 800px;
  padding: 0 24px;
  text-align: center;
}

.search-fullscreen-input {
  width: 100%;
  font-family: var(--font-family);
  font-size: 3rem;
  font-weight: 800;
  color: var(--text-main);
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--border-color);
  padding: 20px 0;
  outline: none;
  text-align: center;
  transition: border-color 0.3s;
}

.search-fullscreen-input:focus {
  border-bottom-color: var(--primary-color);
}

.search-fullscreen-input::placeholder {
  color: #cccccc;
  font-weight: 600;
}

.search-hint {
  margin-top: 24px;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.search-results-container {
  margin-top: 32px;
  max-height: 55vh;
  overflow-y: auto;
  padding: 8px 4px;
}

.search-results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
  text-align: left;
}

.search-result-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 12px;
  background-color: var(--secondary-color, rgba(0, 0, 0, 0.03));
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

:global(html.dark) .search-result-card {
  background-color: rgba(255, 255, 255, 0.05);
}

.search-result-card:hover {
  transform: translateY(-2px);
  border-color: var(--primary-color);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.result-img-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background-color: #f3f4f6;
}

.result-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.result-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.result-store-tag {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent-red, #ef4444);
}

.result-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-main);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-price {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
}

.search-no-results {
  padding: 24px;
  font-size: 1.1rem;
  color: var(--text-muted);
}

.fade-search-enter-active,
.fade-search-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-search-enter-from,
.fade-search-leave-to {
  opacity: 0;
  transform: scale(0.98);
}

/* Desktop Navigation */
.desktop-nav {
  display: none;
}

.desktop-nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  gap: 40px;
}

.desktop-nav-links a {
  font-weight: 500;
  color: var(--text-main);
  transition: color 0.2s;
}

.desktop-nav-links a:hover,
.desktop-nav-links a.router-link-active {
  color: var(--accent-red, #ef4444);
}

/* Megamenu Styles */
.megamenu-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 100%;
}

.chevron {
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid currentColor;
  transition: transform 0.2s;
}

.desktop-nav-links .has-megamenu.is-active .chevron {
  transform: rotate(180deg);
}

.megamenu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: var(--bg-color);
  box-shadow: 0 16px 32px rgba(0,0,0,0.08);
  border-top: 1px solid var(--border-color);
  padding: 40px 0;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
  z-index: 99;
  pointer-events: none;
}

.desktop-nav-links .has-megamenu.is-active .megamenu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
  pointer-events: auto;
}

.megamenu::before {
  content: '';
  position: absolute;
  top: -24px;
  left: 0;
  width: 100%;
  height: 24px;
}

.megamenu-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 48px;
}

.megamenu-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.megamenu-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 12px;
  line-height: 1.2;
}

.megamenu-desc {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 24px;
}

.megamenu-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  background-color: var(--text-main);
  color: var(--bg-color) !important;
  font-weight: 700;
  border-radius: 6px;
  transition: all 0.25s ease;
  font-size: 0.9rem;
  text-decoration: none;
}

.megamenu-btn:hover {
  background-color: var(--primary-color);
  color: #ffffff !important;
  transform: translateY(-2px);
}

.megamenu-lists {
  border-left: 1px solid var(--border-color);
  padding-left: 48px;
}

.sub-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px 24px;
}

.sub-menu li a {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-main);
  transition: color 0.2s, transform 0.2s;
  display: inline-flex;
  align-items: center;
}

.sub-menu li a:hover {
  color: var(--primary-color);
  transform: translateX(4px);
}


@media (min-width: 768px) {
  .header-container {
    padding: 16px 32px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  .lang-dropdown {
    top: calc(100% + 16px);
  }
  
  .desktop-nav {
    display: block;
  }
  
  .hamburger-btn {
    display: none;
  }
  
  .mobile-nav {
    display: none !important;
  }
}

/* Mobile Nav Drawer */
.mobile-nav {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--bg-color);
  border-top: 1px solid var(--border-color);
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out;
}

.mobile-nav.nav-open {
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.nav-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-links li {
  border-bottom: 1px solid var(--border-color);
}

.nav-links a {
  display: block;
  padding: 16px 20px;
  font-weight: 500;
  color: var(--text-main);
  transition: color 0.2s, background-color 0.2s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: var(--accent-red, #ef4444);
  background-color: rgba(0, 0, 0, 0.02);
}

.mobile-submenu-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  font-weight: 500;
  color: var(--text-main);
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
}

.mobile-submenu-toggle:hover {
  color: var(--accent-red, #ef4444);
  background-color: rgba(0, 0, 0, 0.02);
}

.mobile-sub-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: var(--secondary-color);
  border-top: 1px solid var(--border-color);
}

.mobile-sub-menu a {
  padding: 12px 20px 12px 40px;
  font-size: 0.95rem;
  color: var(--text-muted);
}

.mobile-sub-menu a:hover {
  color: var(--accent-red);
}


/* Carrito Flotante */
.floating-cart {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background-color: #09090b;
  color: #ffffff;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 100;
  transition: all 0.25s ease;
}

:global(html.dark) .floating-cart {
  background-color: #f4f4f5;
  color: #09090b;
}

.floating-cart:active {
  transform: scale(0.95);
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: var(--accent-red, #ef4444);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  height: 20px;
  min-width: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border: 2px solid white;
}

/* WhatsApp Flotante */
.floating-whatsapp {
  position: fixed;
  bottom: 24px;
  left: 24px;
  background-color: #25D366;
  color: #ffffff;
  height: 56px;
  border-radius: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  z-index: 100;
  transition: all 0.25s ease;
  cursor: pointer;
  text-decoration: none;
  padding: 0 24px;
  gap: 12px;
}

.whatsapp-text {
  font-family: 'Jost', sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
}

.floating-whatsapp:hover {
  background-color: #128C7E;
  color: #ffffff;
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 8px 24px rgba(37, 211, 102, 0.4);
}

.floating-whatsapp:active {
  transform: scale(0.95);
}

@media (max-width: 600px) {
  .search-fullscreen-input {
    font-size: 2rem;
  }
}
</style>
