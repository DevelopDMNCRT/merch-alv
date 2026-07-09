<template>
  <div class="min-h-screen flex">

    <!-- ── Left panel – form ───────────────────────────────────────────────── -->
    <div class="flex flex-col flex-1 items-center justify-center px-6 py-12 bg-white dark:bg-gray-950">
      <div class="w-full max-w-sm">

        <!-- Logo -->
        <div class="flex justify-center mb-10">
          <img src="/logo-light-01.png" alt="Merch ALV" class="h-12 w-auto dark:hidden" />
          <img src="/logo-dark-01.png" alt="Merch ALV" class="h-12 w-auto hidden dark:block" />
        </div>

        <!-- Heading -->
        <div class="mb-8 text-center">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">Ingresa tus credenciales para continuar</p>
        </div>

        <!-- Error banner -->
        <transition name="fade">
          <div
            v-if="errorMsg"
            class="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ errorMsg }}
          </div>
        </transition>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-5">
          <!-- Username / Email -->
          <div>
            <label for="username" class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Usuario o correo
            </label>
            <input
              v-model="username"
              type="text"
              id="username"
              autocomplete="username"
              placeholder="admin@merchalv.mx"
              :disabled="loading"
              class="w-full h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraseña
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                id="password"
                autocomplete="current-password"
                placeholder="••••••••"
                :disabled="loading"
                class="w-full h-11 rounded-xl border border-gray-300 bg-white pl-4 pr-11 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 transition focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                tabindex="-1"
              >
                <!-- Eye open -->
                <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                </svg>
                <!-- Eye closed -->
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="loading || !username || !password"
            class="relative w-full h-11 rounded-xl bg-brand-500 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span v-if="!loading">Iniciar sesión</span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Verificando...
            </span>
          </button>
        </form>

        <!-- Footer note -->
        <p class="mt-8 text-center text-xs text-gray-400 dark:text-gray-600">
          Acceso restringido · Merch ALV © 2026
        </p>
      </div>
    </div>

    <!-- ── Right panel – brand visual ─────────────────────────────────────── -->
    <div
      class="hidden lg:flex flex-col items-center justify-center w-1/2 relative overflow-hidden"
      style="background-color: #000000;"
    >
      <!-- Decorative circles -->
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10" style="background-color: #ef4444;"></div>
      <div class="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-10" style="background-color: #ef4444;"></div>
      <div class="absolute top-1/3 right-1/4 w-32 h-32 rounded-full opacity-5" style="background-color: #ef4444;"></div>

      <!-- Content -->
      <div class="relative z-10 flex flex-col items-center text-center px-12 max-w-md">
        <img src="/logo-light-01.png" alt="Merch ALV" class="h-14 w-auto mb-10 brightness-0 invert" />
        <h2 class="text-3xl font-extrabold text-white leading-tight mb-4">
          Gestiona tu merch<br/>en un solo lugar.
        </h2>
        <p class="text-white/70 text-base leading-relaxed">
          Administra tiendas, productos, pedidos y clientes de todos tus artistas desde este panel.
        </p>

        <!-- Stat pills -->
        <div class="mt-10 flex gap-4">
          <div class="rounded-2xl px-5 py-3 text-center" style="background: rgba(255,255,255,0.1);">
            <p class="text-2xl font-bold text-white">18+</p>
            <p class="text-xs text-white/60 mt-0.5">Artistas</p>
          </div>
          <div class="rounded-2xl px-5 py-3 text-center" style="background: rgba(255,255,255,0.1);">
            <p class="text-2xl font-bold text-white">100%</p>
            <p class="text-xs text-white/60 mt-0.5">Oficial</p>
          </div>
          <div class="rounded-2xl px-5 py-3 text-center" style="background: rgba(239,68,68,0.2);">
            <p class="text-2xl font-bold" style="color: #ef4444;">MXN</p>
            <p class="text-xs text-white/60 mt-0.5">Moneda base</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref('')

async function handleSubmit() {
  if (!username.value || !password.value) return
  errorMsg.value = ''
  loading.value = true
  try {
    await login(username.value, password.value)
    router.push('/')
  } catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
