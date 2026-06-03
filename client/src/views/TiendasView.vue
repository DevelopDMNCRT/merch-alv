<template>
  <main class="tiendas-view">
    <div class="header-banner tiendas-banner">
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <h1>{{ t('tiendas.bannerTitle') }}</h1>
        <p>{{ t('tiendas.bannerSub') }}</p>
      </div>
    </div>

    <div class="tiendas-container">
      <div class="tiendas-controls">
        <span class="results-count"><strong>{{ sortedStores.length }}</strong> {{ t('tiendas.available') }}</span>
        <div class="filter-group">
          <label for="sort">{{ t('tiendas.sortBy') }}</label>
          <select id="sort" v-model="sortBy" class="sort-select">
            <option value="favorites">{{ t('tiendas.sortPopular') }}</option>
            <option value="asc">{{ t('tiendas.sortAlphaAsc') }}</option>
            <option value="desc">{{ t('tiendas.sortAlphaDesc') }}</option>
          </select>
        </div>
      </div>

      <div class="artist-grid">
        <router-link :to="`/tienda/${encode(store.nombre)}`" class="artist-card" v-for="store in sortedStores" :key="store.id">
          <div class="artist-image-wrapper">
            <img :src="store.imagen_url || '/images/artist1.png'" :alt="store.nombre" class="artist-image" loading="lazy">
            <div class="artist-overlay">
              <button class="overlay-btn">{{ t('tiendas.visitStore') }}</button>
            </div>
          </div>
          <h3 class="artist-name">{{ store.nombre }}</h3>
        </router-link>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useLocale } from '../composables/useLocale.js'

const { t } = useLocale()

const encode = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

const stores = ref([])

const fetchStores = async () => {
  try {
    const res = await fetch('/api/tiendas')
    const data = await res.json()
    stores.value = data.filter(t => t.publico)
  } catch (err) {
    console.error('Error fetching stores:', err)
  }
}

fetchStores()

const sortBy = ref('favorites')

const sortedStores = computed(() => {
  const list = [...stores.value]
  if (sortBy.value === 'asc') {
    return list.sort((a, b) => a.nombre.localeCompare(b.nombre))
  } else if (sortBy.value === 'desc') {
    return list.sort((a, b) => b.nombre.localeCompare(a.nombre))
  }
  return list
})
</script>

<style scoped>
.tiendas-view {
  background-color: var(--secondary-color);
  min-height: 100vh;
  padding-bottom: 80px;
}

/* Header Banner */
.header-banner {
  position: relative;
  height: 250px;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 40px;
}

.tiendas-banner {
  background-image: url('/images/concert_header.png');
}

.banner-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to right, rgba(35, 118, 80, 0.9), rgba(0,0,0,0.6));
}

.banner-content {
  position: relative;
  z-index: 1;
  color: white;
  padding: 0 20px;
}

.banner-content h1 {
  font-family: 'Jost', sans-serif;
  font-size: 3.5rem;
  font-weight: 900;
  margin: 0 0 16px 0;
}

.banner-content p {
  font-family: 'Jost', sans-serif;
  font-size: 1.2rem;
  opacity: 0.9;
  margin: 0;
}

.tiendas-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Controles de Filtrado */
.tiendas-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  background: var(--bg-color);
  padding: 16px 24px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.03);
}

.results-count {
  font-family: 'Jost', sans-serif;
  color: var(--text-muted);
  font-size: 1.1rem;
}

.results-count strong {
  color: var(--text-main);
  font-weight: 800;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.filter-group label {
  font-family: 'Jost', sans-serif;
  font-weight: 700;
  color: var(--text-main);
}

.sort-select {
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  font-family: 'Jost', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-main);
  background-color: var(--bg-color);
  cursor: pointer;
  outline: none;
  min-width: 240px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}

.sort-select:focus {
  border-color: var(--primary-color);
}

/* Grid de Artistas (4 Columnas) */
.artist-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
}

/* Tarjeta de Artista */
.artist-card {
  text-align: center;
  cursor: pointer;
  group: artist;
  text-decoration: none;
  display: block;
}

.artist-image-wrapper {
  position: relative;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
  border: 4px solid white;
  transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.4s ease;
}

.artist-card:hover .artist-image-wrapper {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 32px rgba(0,0,0,0.12);
}

.artist-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.artist-card:hover .artist-image {
  transform: scale(1.1);
}

.artist-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(35, 118, 80, 0.7); /* Brand primary with opacity */
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.artist-card:hover .artist-overlay {
  opacity: 1;
}

.overlay-btn {
  background: var(--bg-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 24px;
  font-family: 'Jost', sans-serif;
  font-weight: 800;
  font-size: 1rem;
  cursor: pointer;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.artist-card:hover .overlay-btn {
  transform: translateY(0);
}

.artist-name {
  font-family: 'Jost', sans-serif;
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
  transition: color 0.2s ease;
}

.artist-card:hover .artist-name {
  color: var(--primary-color);
}

/* Responsividad */
@media (max-width: 1024px) {
  .artist-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .tiendas-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .sort-select {
    width: 100%;
  }

  .artist-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .tiendas-header h1 {
    font-size: 2.2rem;
  }
}

@media (max-width: 480px) {
  .artist-name {
    font-size: 1.1rem;
  }
}
</style>
