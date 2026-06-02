<template>
  <div class="max-w-full overflow-x-auto custom-scrollbar">
    <table class="min-w-full">
      <thead>
        <tr class="border-b border-gray-200 dark:border-gray-700">
          <th class="px-5 py-3 text-left sm:px-6">
            <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">ID</p>
          </th>
          <th class="px-5 py-3 text-left sm:px-6">
            <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Nombre</p>
          </th>
          <th class="px-5 py-3 text-left sm:px-6">
            <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Alta</p>
          </th>
          <th class="px-5 py-3 text-left sm:px-6">
            <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Última Compra</p>
          </th>
          <th class="px-5 py-3 text-left sm:px-6">
            <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Correo</p>
          </th>
          <th class="px-5 py-3 text-left sm:px-6">
            <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Pedidos</p>
          </th>
          <th class="px-5 py-3 text-left sm:px-6">
            <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
        <tr
          v-for="cliente in clientes"
          :key="cliente.id"
          class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
        >
          <!-- ID -->
          <td class="px-5 py-4 sm:px-6">
            <span class="font-mono text-theme-sm font-semibold text-brand-600 dark:text-brand-400">
              {{ cliente.cid }}
            </span>
          </td>

          <!-- Nombre -->
          <td class="px-5 py-4 sm:px-6">
            <div class="flex items-center gap-3">
              <div class="flex-shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-500/20 flex items-center justify-center">
                <span class="text-xs font-bold text-brand-600 dark:text-brand-400">{{ initials(cliente.nombre) }}</span>
              </div>
              <span class="font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ cliente.nombre }}</span>
            </div>
          </td>

          <!-- Alta -->
          <td class="px-5 py-4 sm:px-6">
            <span class="text-gray-500 text-theme-sm dark:text-gray-400">{{ cliente.alta }}</span>
          </td>

          <!-- Última Compra -->
          <td class="px-5 py-4 sm:px-6">
            <span class="text-gray-500 text-theme-sm dark:text-gray-400">{{ cliente.ultimaCompra }}</span>
          </td>

          <!-- Correo -->
          <td class="px-5 py-4 sm:px-6">
            <a
              :href="`mailto:${cliente.email}`"
              class="text-theme-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 hover:underline"
              @click.stop
            >{{ cliente.email }}</a>
          </td>

          <!-- Pedidos -->
          <td class="px-5 py-4 sm:px-6">
            <span class="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {{ cliente.pedidos }}
            </span>
          </td>

          <!-- Acciones -->
          <td class="px-5 py-4 sm:px-6">
            <router-link
              :to="`/clientes/${cliente.id}`"
              class="inline-flex items-center gap-1.5 text-theme-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              Ver
            </router-link>
          </td>
        </tr>

        <tr v-if="clientes.length === 0">
          <td colspan="7" class="px-5 py-12 text-center">
            <p class="text-sm text-gray-400 dark:text-gray-500">No hay clientes registrados.</p>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  clientes: { type: Array, default: () => [] },
})

const initials = (nombre) => nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
</script>
