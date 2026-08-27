<template>
  <main class="facturacion-view">
    <div class="header-banner">
      <div class="banner-overlay"></div>
      <div class="banner-content">
        <h1>{{ t('facturacion.bannerTitle') }}</h1>
        <p>{{ t('facturacion.bannerSub') }}</p>
      </div>
    </div>

    <div class="container">
      <div class="form-card">
        <h2 class="form-title">{{ t('facturacion.formTitle') }}</h2>
        <p class="form-subtitle">{{ t('facturacion.formSubtitle') }}</p>

        <form @submit.prevent="submitForm" class="billing-form">
          <!-- Row 1 -->
          <div class="form-row row-1">
            <div class="input-group">
              <label for="orden">{{ t('facturacion.labelOrden') }}</label>
              <input type="text" id="orden" v-model="form.orden" :placeholder="t('facturacion.phOrden')" required>
            </div>
            <div class="input-group">
              <label for="email">{{ t('facturacion.labelEmail') }}</label>
              <input type="email" id="email" v-model="form.email" :placeholder="t('facturacion.phEmail')" required>
            </div>
          </div>

          <!-- Row 2 -->
          <div class="form-row row-2">
            <div class="input-group">
              <label for="nombre">{{ t('facturacion.labelNombre') }}</label>
              <input type="text" id="nombre" v-model="form.nombre" :placeholder="t('facturacion.phNombre')" required>
            </div>
            <div class="input-group">
              <label for="rfc">{{ t('facturacion.labelRfc') }}</label>
              <input type="text" id="rfc" v-model="form.rfc" :placeholder="t('facturacion.phRfc')" style="text-transform: uppercase;" required>
            </div>
          </div>

          <!-- Row 3 -->
          <div class="form-row row-3">
            <div class="input-group">
              <label for="calle">{{ t('facturacion.labelCalle') }}</label>
              <input type="text" id="calle" v-model="form.calle" :placeholder="t('facturacion.phCalle')" required>
            </div>
            <div class="input-group">
              <label for="ext">{{ t('facturacion.labelExt') }}</label>
              <input type="text" id="ext" v-model="form.ext" :placeholder="t('facturacion.phExt')" required>
            </div>
            <div class="input-group">
              <label for="int">{{ t('facturacion.labelInt') }}</label>
              <input type="text" id="int" v-model="form.int" :placeholder="t('facturacion.phInt')">
            </div>
          </div>

          <!-- Row 4 -->
          <div class="form-row row-4">
            <div class="input-group">
              <label for="colonia">{{ t('facturacion.labelColonia') }}</label>
              <input type="text" id="colonia" v-model="form.colonia" :placeholder="t('facturacion.phColonia')" required>
            </div>
            <div class="input-group">
              <label for="ciudad">{{ t('facturacion.labelCiudad') }}</label>
              <input type="text" id="ciudad" v-model="form.ciudad" :placeholder="t('facturacion.phCiudad')" required>
            </div>
            <div class="input-group">
              <label for="estado">{{ t('facturacion.labelEstado') }}</label>
              <input type="text" id="estado" v-model="form.estado" :placeholder="t('facturacion.phEstado')" required>
            </div>
            <div class="input-group">
              <label for="cp">{{ t('facturacion.labelCp') }}</label>
              <input type="text" id="cp" v-model="form.cp" :placeholder="t('facturacion.phCp')" required>
            </div>
            <div class="input-group">
              <label for="cfdi">{{ t('facturacion.labelCfdi') }}</label>
              <div class="select-wrapper">
                <select id="cfdi" v-model="form.cfdi" required>
                  <option value="" disabled>{{ t('facturacion.cfdiSelect') }}</option>
                  <option value="G01">{{ t('facturacion.cfdiG01') }}</option>
                  <option value="G03">{{ t('facturacion.cfdiG03') }}</option>
                  <option value="P01">{{ t('facturacion.cfdiP01') }}</option>
                </select>
                <span class="select-arrow"></span>
              </div>
            </div>
          </div>

          <!-- File Upload -->
          <div class="file-upload-section">
            <label class="upload-label">{{ t('facturacion.uploadLabel') }}</label>
            <div class="drop-zone" :class="{ 'drag-over': isDragging }" @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop" @click="$refs.fileInput.click()">
              <input type="file" ref="fileInput" class="hidden-input" @change="handleFileChange" accept=".pdf,image/*">
              <div class="drop-content" v-if="!form.file">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="upload-icon">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p><strong>{{ t('facturacion.uploadText') }}</strong> {{ t('facturacion.uploadSubtext') }}</p>
                <span class="file-hint">{{ t('facturacion.uploadHint') }}</span>
              </div>
              <div class="drop-content file-selected" v-else>
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="file-icon">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <p class="file-name">{{ form.file.name }}</p>
                <button type="button" class="remove-file-btn" @click.stop="form.file = null">{{ t('facturacion.changeFile') }}</button>
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="form-actions">
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              {{ isSubmitting ? t('facturacion.processing') : t('facturacion.submitBtn') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useLocale } from '../composables/useLocale.js'

const { t } = useLocale()

const form = reactive({
  orden: '',
  email: '',
  nombre: '',
  rfc: '',
  calle: '',
  ext: '',
  int: '',
  colonia: '',
  ciudad: '',
  estado: '',
  cp: '',
  cfdi: '',
  file: null
})

const isDragging = ref(false)
const isSubmitting = ref(false)
const fileInput = ref(null)

const handleFileChange = (e) => {
  if (e.target.files.length > 0) {
    form.file = e.target.files[0]
  }
}

const handleDrop = (e) => {
  isDragging.value = false
  if (e.dataTransfer.files.length > 0) {
    form.file = e.dataTransfer.files[0]
  }
}

const submitForm = () => {
  isSubmitting.value = true
  setTimeout(() => {
    alert(t('facturacion.successMsg'))
    isSubmitting.value = false
  }, 1500)
}

onMounted(() => {
  window.scrollTo(0, 0)
})
</script>

<style scoped>
.facturacion-view {
  background-color: #f7f9fa;
  min-height: 100vh;
  padding-bottom: 80px;
}

/* Header Banner */
.header-banner {
  position: relative;
  height: 250px;
  background-image: url('/images/accounting_header.png');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
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
}

.banner-content h1 {
  font-family: 'Nunito', sans-serif;
  font-size: 2.5rem;
  font-weight: 900;
  margin: 0 0 8px 0;
}

.banner-content p {
  font-family: 'Nunito Sans', sans-serif;
  font-size: 1.1rem;
  opacity: 0.9;
  margin: 0;
}

/* Contenedor del Formulario */
.container {
  max-width: 900px;
  margin: -40px auto 0;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.form-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.06);
  padding: 40px;
}

.form-title {
  font-family: 'Nunito', sans-serif;
  font-size: 1.8rem;
  color: var(--text-main);
  margin: 0 0 8px 0;
}

.form-subtitle {
  font-family: 'Nunito Sans', sans-serif;
  color: var(--text-muted);
  margin: 0 0 32px 0;
  font-size: 1rem;
}

/* Grid Layout */
.billing-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-row {
  display: grid;
  gap: 20px;
}

.row-1 { grid-template-columns: 1fr 2fr; }
.row-2 { grid-template-columns: 2fr 1fr; }
.row-3 { grid-template-columns: 2fr 1fr 1fr; }
.row-4 { grid-template-columns: 2fr 2fr 2fr 1.5fr 2fr; }

/* Inputs */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-family: 'Nunito Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
}

.input-group input,
.input-group select {
  font-family: 'Nunito Sans', sans-serif;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  color: var(--text-main);
  background-color: #fafafa;
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
  width: 100%;
}

.input-group input:focus,
.input-group select:focus {
  outline: none;
  border-color: var(--primary-color);
  background-color: white;
  box-shadow: 0 0 0 3px rgba(35, 118, 80, 0.1);
}

.input-group input::placeholder {
  color: #a0a0a0;
}

/* Custom Select */
.select-wrapper {
  position: relative;
}

.select-wrapper select {
  appearance: none;
  cursor: pointer;
}

.select-arrow {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #666;
  pointer-events: none;
}

/* Dropzone de Archivos */
.file-upload-section {
  margin-top: 8px;
}

.upload-label {
  display: block;
  font-family: 'Nunito Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}

.drop-zone {
  border: 2px dashed #d0d0d0;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background-color: #fafafa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.drop-zone:hover, .drop-zone.drag-over {
  border-color: var(--primary-color);
  background-color: rgba(35, 118, 80, 0.02);
}

.hidden-input {
  display: none;
}

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  color: #a0a0a0;
  transition: color 0.2s;
}

.drop-zone:hover .upload-icon {
  color: var(--primary-color);
}

.drop-content p {
  margin: 0;
  font-family: 'Nunito Sans', sans-serif;
  color: var(--text-main);
  font-size: 1rem;
}

.file-hint {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.file-selected {
  gap: 8px;
}

.file-icon {
  color: var(--primary-color);
}

.file-name {
  font-weight: 700;
  word-break: break-all;
}

.remove-file-btn {
  background: none;
  border: none;
  color: #d32f2f;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 8px;
}

.remove-file-btn:hover {
  text-decoration: underline;
}

/* Botón de Enviar */
.form-actions {
  margin-top: 16px;
}

.submit-btn {
  width: 100%;
  background-color: var(--secondary-color);
  color: #111;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-family: 'Nunito', sans-serif;
  font-size: 1.2rem;
  font-weight: 900;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(246, 178, 0, 0.3);
}

.submit-btn:disabled {
  background-color: #e0e0e0;
  color: #a0a0a0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsividad */
@media (max-width: 768px) {
  .row-1, .row-2, .row-3, .row-4 {
    grid-template-columns: 1fr;
  }
  
  .form-card {
    padding: 24px;
  }
}
</style>
