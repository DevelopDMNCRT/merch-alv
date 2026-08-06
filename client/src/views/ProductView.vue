<template>
  <main class="product-view">
    <!-- Breadcrumb -->
    <div class="breadcrumb-container">
      <router-link to="/" class="breadcrumb-link">{{ t('product.home') }}</router-link>
      <span class="breadcrumb-sep">/</span>
      <span class="breadcrumb-current">{{ product.nombre }}</span>
    </div>

    <!-- Product Details -->
    <section class="product-details-section">
      <div class="product-grid">
        <!-- Image Gallery -->
        <div class="product-image-col">
          <div class="main-image-container">
            <div v-if="!selectedImage" class="product-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="placeholder-icon">
                <path d="M7 2L2 5V10H5V21H19V10H22V5L17 2H14C14 3.1 13.1 4 12 4C10.9 4 10 3.1 10 2H7Z" />
              </svg>
            </div>
            <img v-else :src="selectedImage" :alt="product.nombre" class="main-image" :key="selectedImage">
            <span class="product-tag" v-if="product.flag">{{ product.flag }}</span>
          </div>

          <!-- Thumbnails -->
          <div class="gallery-thumbs" v-if="galleryImages.length > 1">
            <button
              v-for="(img, i) in galleryImages"
              :key="i"
              class="thumb-btn"
              :class="{ active: selectedImage === img }"
              @click="selectedImage = img"
            >
              <img :src="img" :alt="`${product.nombre} ${i + 1}`" class="thumb-img">
            </button>
          </div>
        </div>

        <!-- Info & Controls -->
        <div class="product-info-col">
          <span class="product-artist">{{ product.tienda }}</span>
          <h1 class="product-name-title">{{ product.nombre }}</h1>
          <div class="price-header-wrapper">
            <template v-if="product.descuento > 0">
              <div class="flex-price-row">
                <span class="product-price-large price-discounted">${{ Number(finalPrice).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} MXN</span>
                <span class="price-original-large">${{ Number(displayPrice).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} MXN</span>
                <span class="discount-badge-detail">-{{ product.descuento }}%</span>
              </div>
            </template>
            <template v-else>
              <p class="product-price-large">{{ formatPrice(displayPrice) }}</p>
            </template>
          </div>


          <p class="product-description">
            {{ product.descripcion || t('product.defaultDesc') }}
          </p>

          <div class="product-options">
            <!-- Grupos de atributos (Talla, Color, etc.) -->
            <template v-if="product.es_variable && attrGroups.length > 0">
              <div v-for="group in attrGroups" :key="group.nombre" class="option-group">
                <label class="option-label">
                  {{ group.nombre }}
                  <span v-if="selectedAttrs[group.nombre]" class="selected-val"> — {{ selectedAttrs[group.nombre] }}</span>
                </label>
                <div class="size-selector">
                  <!-- Swatches de color -->
                  <template v-if="isColorGroup(group.nombre)">
                    <button
                      v-for="opt in getAvailableOptions(group.nombre)"
                      :key="opt.valor"
                      class="color-btn"
                      :class="{ active: selectedAttrs[group.nombre] === opt.valor, unavailable: !opt.available }"
                      :style="{ '--swatch': opt.color || '#aaaaaa' }"
                      :title="opt.valor"
                      :disabled="!opt.available"
                      @click="selectAttr(group.nombre, opt.valor)"
                    >
                      <span class="color-swatch"></span>
                    </button>
                  </template>
                  <!-- Botones de texto (tallas, etc.) -->
                  <template v-else>
                    <button
                      v-for="opt in getAvailableOptions(group.nombre)"
                      :key="opt.valor"
                      class="size-btn"
                      :class="{ active: selectedAttrs[group.nombre] === opt.valor, unavailable: !opt.available }"
                      :disabled="!opt.available"
                      @click="selectAttr(group.nombre, opt.valor)"
                    >
                      {{ opt.valor }}
                    </button>
                  </template>
                </div>
              </div>
            </template>

            <!-- Fallback: lista plana (sin atributos definidos) -->
            <template v-else-if="product.es_variable && variations.length > 0">
              <div class="option-group">
                <label class="option-label">{{ t('product.size') }}</label>
                <div class="size-selector">
                  <button
                    v-for="v in variations"
                    :key="v.id"
                    class="size-btn"
                    :class="{ active: selectedVariation?.id === v.id }"
                    @click="selectVariationDirect(v)"
                  >
                    {{ v.valor }}
                  </button>
                </div>
              </div>
            </template>

            <!-- Cantidad -->
            <div class="option-group">
              <label class="option-label">{{ t('product.quantity') }}</label>
              <div class="quantity-selector">
                <button class="qty-btn" @click="quantity > 1 ? quantity-- : null">-</button>
                <input type="number" class="qty-input" v-model.number="quantity" min="1" :max="availableStock">
                <button class="qty-btn" @click="increaseQty">+</button>
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="product-actions">
            <button class="add-to-cart-large" @click="addToCart" :disabled="isAgotado">
              {{ isAgotado ? 'Agotado' : t('product.addToCart') }}
              <svg v-if="!isAgotado" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </button>
          </div>
          
          <div class="product-perks">
            <div class="perk-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              <span>{{ t('product.shipping') }}</span>
            </div>
            <div class="perk-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span>{{ t('product.securePayments') }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Productos Relacionados -->
    <section class="related-products-section">
      <div class="related-container">
        <h2 class="related-title">{{ t('product.relatedTitle') }}</h2>
        <div class="related-grid">
          <router-link :to="`/producto/${relProduct.id}`" class="product-card" v-for="relProduct in relatedProducts" :key="relProduct.id">
            <div class="product-image-wrapper">
              <div v-if="!relProduct.imagen_url" class="product-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="placeholder-icon-sm">
                  <path d="M7 2L2 5V10H5V21H19V10H22V5L17 2H14C14 3.1 13.1 4 12 4C10.9 4 10 3.1 10 2H7Z" />
                </svg>
              </div>
              <img v-else :src="relProduct.imagen_url" :alt="relProduct.nombre" class="product-image" loading="lazy">
              <span class="product-tag" v-if="relProduct.flag">{{ relProduct.flag }}</span>
            </div>
            <div class="product-info">
              <span class="product-artist">{{ relProduct.tienda }}</span>
              <h3 class="product-name">{{ relProduct.nombre }}</h3>
              <div class="product-footer">
                <span class="product-price">{{ formatPrice(relProduct.precio) }}</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { cartState, cartActions } from '../store/cart.js';
import { useLocale } from '../composables/useLocale.js';
import { formatPrice } from '../store/locale.js';

const { t, tTag } = useLocale();

const route = useRoute();

// Estado
const quantity = ref(1);
const selectedImage = ref(null);
const selectedAttrs = ref({});
const selectedVariation = ref(null);

const product = ref({});
const relatedProducts = ref([]);
const variations = ref([]);

const isAgotado = computed(() => {
  return product.value?.flag && product.value.flag.toUpperCase() === 'AGOTADO';
});

// Gallery: imagen principal + galería sin duplicados
const galleryImages = computed(() => {
  const imgs = [];
  if (product.value.imagen_url) imgs.push(product.value.imagen_url);
  const galeria = product.value.galeria_urls;
  if (Array.isArray(galeria)) galeria.forEach(u => { if (u && !imgs.includes(u)) imgs.push(u); });
  return imgs;
});

// Parsear atributos del producto
const attrGroups = computed(() => {
  const raw = product.value.atributos;
  if (!raw) return [];
  try { return Array.isArray(raw) ? raw : JSON.parse(raw); }
  catch { return []; }
});

// Variaciones con attrs mapeados por grupo
const parsedVariations = computed(() => {
  const groups = attrGroups.value;
  return variations.value.map(v => {
    const parts = v.valor ? v.valor.split(' - ') : [];
    const attrs = {};
    groups.forEach((g, i) => { attrs[g.nombre] = parts[i] || ''; });
    return { ...v, attrs };
  });
});

const isColorGroup = (nombre) => nombre.toLowerCase().includes('color');

// Opciones disponibles para un grupo dado las selecciones anteriores
const getAvailableOptions = (groupNombre) => {
  const groups = attrGroups.value;
  const idx = groups.findIndex(g => g.nombre === groupNombre);
  const group = groups[idx];
  if (!group) return [];
  const allOpts = (group.opciones || '').split(',').map(o => o.trim()).filter(Boolean);
  const prevGroups = groups.slice(0, idx);
  const relevant = parsedVariations.value.filter(v =>
    prevGroups.every(pg => !selectedAttrs.value[pg.nombre] || v.attrs[pg.nombre] === selectedAttrs.value[pg.nombre])
  );
  return allOpts.map(opt => {
    const match = relevant.find(v => v.attrs[groupNombre] === opt);
    return { valor: opt, available: !!match, color: match?.color || group.colores?.[opt] || null };
  });
};

const updateSelectedVariation = () => {
  const groups = attrGroups.value;
  if (!groups.every(g => selectedAttrs.value[g.nombre])) {
    selectedVariation.value = null;
    // Selección incompleta: mantener imagen principal del producto
    selectedImage.value = product.value.imagen_url || null;
    return;
  }
  const match = parsedVariations.value.find(v => groups.every(g => v.attrs[g.nombre] === selectedAttrs.value[g.nombre]));
  selectedVariation.value = match || null;
  // Solo cambiar imagen si la variación tiene su propia imagen
  if (match?.imagen_url) {
    selectedImage.value = match.imagen_url;
  } else {
    selectedImage.value = product.value.imagen_url || null;
  }
};

const selectAttr = (groupNombre, valor) => {
  selectedAttrs.value[groupNombre] = valor;
  // Limpiar selecciones de grupos posteriores
  const groups = attrGroups.value;
  const idx = groups.findIndex(g => g.nombre === groupNombre);
  groups.slice(idx + 1).forEach(g => { delete selectedAttrs.value[g.nombre]; });
  // Auto-seleccionar siguiente grupo si solo hay una opción disponible
  const nextGroup = groups[idx + 1];
  if (nextGroup) {
    const opts = getAvailableOptions(nextGroup.nombre).filter(o => o.available);
    if (opts.length === 1) selectedAttrs.value[nextGroup.nombre] = opts[0].valor;
  }
  updateSelectedVariation();
};

const selectVariationDirect = (v) => {
  selectedVariation.value = v;
  selectedImage.value = v.imagen_url || product.value.imagen_url || null;
};

const initSelections = () => {
  attrGroups.value.forEach(group => {
    const opts = getAvailableOptions(group.nombre).filter(o => o.available);
    if (opts.length > 0) selectedAttrs.value[group.nombre] = opts[0].valor;
  });
  updateSelectedVariation();
};

const displayPrice = computed(() => {
  if (product.value.es_variable) {
    if (selectedVariation.value) return selectedVariation.value.precio;
    if (variations.value.length > 0) return variations.value[0].precio;
  }
  return product.value.precio;
});

const finalPrice = computed(() => {
  const base = Number(displayPrice.value || 0);
  const desc = Number(product.value.descuento || 0);
  if (desc > 0) {
    return base * (1 - desc / 100);
  }
  return base;
});


const loadProduct = async () => {
  const id = route.params.id;
  try {
    const res = await fetch(`/api/products/${id}`);
    const data = await res.json();
    product.value = data;
    variations.value = data.variaciones || [];
    selectedAttrs.value = {};
    selectedVariation.value = null;
    selectedImage.value = data.imagen_url || (Array.isArray(data.galeria_urls) && data.galeria_urls[0]) || null;
    const allRes = await fetch('/api/products');
    const allData = await allRes.json();
    relatedProducts.value = allData.filter(p => p.tienda === data.tienda && p.id !== data.id && p.es_publico).slice(0, 4);
    // No auto-seleccionar variaciones: el usuario elige desde cero
    // La imagen inicial es siempre la imagen principal del producto
  } catch (err) { console.error('Error loading product:', err); }
  window.scrollTo(0, 0);
  quantity.value = 1;
};

onMounted(() => { loadProduct(); });
watch(() => route.params.id, () => { loadProduct(); });

const availableStock = computed(() => {
  if (product.value.es_variable) {
    return selectedVariation.value ? selectedVariation.value.stock : 0;
  }
  return product.value.stock || 0;
});

watch(quantity, (newVal) => {
  if (newVal < 1) {
    quantity.value = 1;
    return;
  }
  
  const isVar = product.value.es_variable;
  if (!isVar || (isVar && selectedVariation.value)) {
    const stock = availableStock.value;
    if (newVal > stock) {
      quantity.value = stock > 0 ? stock : 1;
    }
  }
});

watch(selectedVariation, (newVal) => {
  if (newVal && quantity.value > newVal.stock) {
    quantity.value = newVal.stock > 0 ? newVal.stock : 1;
  }
});

const increaseQty = () => {
  const stock = availableStock.value;
  const isVar = product.value.es_variable;
  
  if (isVar && !selectedVariation.value) {
    alert('Por favor, selecciona todas las opciones (ej. talla, color) antes de elegir la cantidad.');
    return;
  }
  
  if (quantity.value < stock) {
    quantity.value++;
  }
};

const addToCart = () => {
  if (product.value.es_variable) {
    const groups = attrGroups.value;
    const allSelected = groups.every(g => selectedAttrs.value[g.nombre]);
    if (!allSelected) {
      alert('Por favor, selecciona todas las opciones disponibles (ej. talla, color) antes de agregar al carrito.');
      return;
    }
    
    if (variations.value.length > 0 && !selectedVariation.value) {
      alert('Por favor, selecciona una opción antes de agregar al carrito.');
      return;
    }
  }

  const stock = availableStock.value;
  if (stock <= 0) {
    alert('Lo sentimos, este producto no tiene stock disponible.');
    return;
  }

  if (quantity.value > stock) {
    alert(`Lo sentimos, solo hay ${stock} unidades disponibles en stock.`);
    return;
  }

  const label = Object.values(selectedAttrs.value).join(' - ') || selectedVariation.value?.valor || '';
  
  // Check if they already have some in the cart, and the total would exceed the stock
  const existingItem = cartState.items.find(
    item => item.id === product.value.id && item.size === label
  );
  const currentInCart = existingItem ? existingItem.quantity : 0;
  if (currentInCart + quantity.value > stock) {
    alert(`No puedes agregar más unidades. Ya tienes ${currentInCart} en el carrito y el stock total disponible es de ${stock}.`);
    return;
  }

  const productToCart = { 
    ...product.value, 
    precio: finalPrice.value,
    stock: stock
  };

  
  cartActions.addItem(productToCart, label, quantity.value);
};

</script>

<style scoped>
.product-view {
  display: flex;
  flex-direction: column;
  background-color: var(--secondary-color);
}

/* Breadcrumb */
.breadcrumb-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 40px 16px;
  width: 100%;
  font-family: 'Jost', sans-serif;
  font-size: 0.95rem;
  color: var(--text-muted);
}

.breadcrumb-link {
  color: var(--text-muted);
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: var(--primary-color);
}

.breadcrumb-sep {
  margin: 0 8px;
  color: #ccc;
}

.breadcrumb-current {
  color: var(--text-main);
  font-weight: 600;
}

/* Product Details */
.product-details-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 40px 80px;
  width: 100%;
}

.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
}

.main-image-container {
  position: relative;
  background: var(--bg-color);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.05);
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

/* Gallery Thumbnails */
.gallery-thumbs {
  display: flex;
  gap: 10px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.thumb-btn {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  background: var(--bg-color);
  padding: 4px;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
  flex-shrink: 0;
}

.thumb-btn:hover {
  border-color: #aaa;
}

.thumb-btn.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(35, 118, 80, 0.2);
}

.thumb-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

.main-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.5s ease, opacity 0.2s ease;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
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
  width: 120px;
  height: 120px;
  opacity: 0.5;
}

.placeholder-icon-sm {
  width: 60px;
  height: 60px;
  opacity: 0.5;
}

.main-image-container:hover .main-image {
  transform: scale(1.05);
}

.product-tag {
  position: absolute;
  top: 24px;
  left: 24px;
  background: var(--text-main);
  color: var(--bg-color);
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  font-size: 0.85rem;
  padding: 6px 16px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.product-info-col {
  display: flex;
  flex-direction: column;
}

.product-artist {
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  color: var(--primary-color);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.product-name-title {
  font-family: 'Jost', sans-serif;
  font-size: 3rem;
  font-weight: 900;
  color: var(--text-main);
  line-height: 1.1;
  margin-bottom: 16px;
}

.product-price-large {
  font-family: 'Jost', sans-serif;
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 0;
}

.price-header-wrapper {
  margin-bottom: 24px;
}

.flex-price-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.price-discounted {
  color: #dc2626 !important;
  font-size: 2rem !important;
}

.price-original-large {
  font-family: 'Jost', sans-serif;
  font-size: 1.25rem;
  color: #9ca3af !important;
  text-decoration: line-through !important;
  font-weight: 600;
}

.discount-badge-detail {
  font-family: 'Jost', sans-serif;
  font-size: 0.8rem;
  font-weight: 800;
  background-color: var(--accent-red, #ef4444);
  color: #ffffff;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.25);
  letter-spacing: 0.5px;
}



.product-description {
  font-family: 'Jost', sans-serif;
  font-size: 1.1rem;
  line-height: 1.6;
  color: var(--text-muted);
  margin-bottom: 40px;
}

.product-options {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 40px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-label {
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  color: var(--text-main);
  font-size: 1rem;
}

.size-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.size-btn {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  background: var(--bg-color);
  font-family: 'Jost', sans-serif;
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-main);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.size-btn:hover {
  border-color: #ccc;
}

.size-btn.active {
  border-color: var(--primary-color);
  background: var(--primary-color);
  color: white;
}

.size-btn.unavailable {
  opacity: 0.35;
  text-decoration: line-through;
  cursor: not-allowed;
}

.selected-val {
  font-weight: 600;
  color: var(--primary-color);
}

/* Color swatches */
.color-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 3px solid transparent;
  background: transparent;
  padding: 3px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.color-btn.active {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px white, 0 0 0 4px var(--primary-color);
}

.color-btn.unavailable {
  opacity: 0.3;
  cursor: not-allowed;
}

.color-swatch {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: var(--swatch, #ccc);
  border: 1px solid rgba(0,0,0,0.12);
}

.quantity-selector {
  display: inline-flex;
  align-items: center;
  background: var(--bg-color);
  border: 2px solid var(--border-color);
  border-radius: 12px;
  width: fit-content;
  overflow: hidden;
}

.qty-btn {
  background: transparent;
  border: none;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  cursor: pointer;
  color: var(--text-main);
  transition: background 0.2s;
}

.qty-btn:hover {
  background: var(--secondary-color);
}

.qty-input {
  width: 50px;
  height: 48px;
  border: none;
  text-align: center;
  font-family: 'Jost', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-main);
  background: var(--bg-color);
  -moz-appearance: textfield;
}
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.product-actions {
  margin-bottom: 40px;
}

.add-to-cart-large {
  width: 100%;
  background: var(--primary-color);
  color: var(--button-text);
  border: none;
  border-radius: 16px;
  padding: 20px;
  font-family: 'Jost', sans-serif;
  font-weight: 900;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.add-to-cart-large:not(:disabled):hover {
  opacity: 0.8;
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
}

.add-to-cart-large:not(:disabled):active {
  transform: translateY(0);
}

.add-to-cart-large:disabled {
  background: var(--border-color);
  color: var(--text-muted);
  cursor: not-allowed;
  opacity: 0.6;
  box-shadow: none;
}

.product-perks {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 32px;
  border-top: 1px solid var(--border-color);
}

.perk-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-muted);
  font-family: 'Jost', sans-serif;
  font-weight: 600;
  font-size: 1rem;
}

.perk-item svg {
  color: var(--primary-color);
}

/* Relacionados */
.related-products-section {
  background: var(--bg-color);
  padding: 80px 0;
}

.related-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

.related-title {
  font-family: 'Jost', sans-serif;
  font-size: 2.2rem;
  font-weight: 900;
  text-align: center;
  margin-bottom: 48px;
  color: var(--text-main);
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

.product-card {
  text-decoration: none;
  display: block;
  background: transparent;
  border-radius: 20px;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.product-card:hover {
  transform: translateY(-8px);
}

.product-image-wrapper {
  background: var(--secondary-color);
  border-radius: 20px;
  padding: 32px;
  aspect-ratio: 1/1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transition: background 0.3s;
}

.product-card:hover .product-image-wrapper {
  background: var(--bg-color);
  box-shadow: 0 16px 40px rgba(0,0,0,0.08);
}

.product-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}

.product-card:hover .product-image {
  transform: scale(1.08);
}

.product-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  background: var(--text-main);
  color: var(--bg-color);
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  font-size: 0.75rem;
  padding: 4px 12px;
  border-radius: 20px;
  text-transform: uppercase;
}

.product-info {
  padding: 0 8px;
  display: flex;
  flex-direction: column;
}

.product-artist {
  font-family: 'Jost', sans-serif;
  font-weight: 700;
  color: var(--primary-color);
  font-size: 0.85rem;
  margin-bottom: 4px;
}

.product-name {
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  font-size: 1.2rem;
  color: var(--text-main);
  margin-bottom: 8px;
  line-height: 1.3;
}

.product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.product-price {
  font-family: 'Jost', sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-main);
}

@media (max-width: 1024px) {
  .product-grid {
    gap: 40px;
  }
}

@media (max-width: 900px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
  .main-image-container {
    max-width: 600px;
    margin: 0 auto;
  }
  .product-name-title {
    font-size: 2.5rem;
  }
  .related-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .breadcrumb-container,
  .product-details-section,
  .related-container {
    padding-left: 24px;
    padding-right: 24px;
  }
  .product-name-title {
    font-size: 2rem;
  }
  .product-price-large {
    font-size: 1.5rem;
  }
  .add-to-cart-large {
    font-size: 1.1rem;
    padding: 16px;
  }
  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>
