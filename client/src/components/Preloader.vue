<script setup>
import { ref, onMounted } from 'vue'

const isVisible = ref(true)
const isFading = ref(false)

onMounted(() => {
  // Simular carga mínima de 1.5s para apreciar la animación
  setTimeout(() => {
    isFading.value = true
    setTimeout(() => {
      isVisible.value = false
    }, 600) // Duración del fade-out
  }, 1800)
})
</script>

<template>
  <div v-if="isVisible" class="preloader" :class="{ 'fade-out': isFading }">
    <div class="preloader-content">
      <div class="logo-animated-container">
        <img src="/icon.png" alt="Merch ALV" class="logo-img-animated" />
      </div>
      <div class="loading-bar-container">
        <div class="loading-bar"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: #000000; /* Sleek Pure Black */
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.6s ease, visibility 0.6s;
}

.preloader.fade-out {
  opacity: 0;
  visibility: hidden;
}

.preloader-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.logo-img-animated {
  width: 90px;
  height: auto;
  animation: breathing-logo 2s ease-in-out infinite;
}

.loading-bar-container {
  width: 160px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin-top: 5px;
}

.loading-bar {
  width: 40%;
  height: 100%;
  background: #ef4444; /* Red accent loading progress */
  animation: scan-loading 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  border-radius: 10px;
  box-shadow: 0 0 8px #ef4444;
}

@keyframes breathing-logo {
  0%, 100% {
    transform: scale(1);
    opacity: 0.85;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
}

@keyframes scan-loading {
  0% {
    transform: translateX(-150%);
  }
  100% {
    transform: translateX(250%);
  }
}
</style>
