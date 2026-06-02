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
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Correo</p>
            </th>
            <th class="px-5 py-3 text-left sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Fecha</p>
            </th>
            <th class="px-5 py-3 text-left sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Rol</p>
            </th>
            <th class="px-5 py-3 text-left sm:px-6">
              <p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr
            v-for="usuario in usuarios"
            :key="usuario.id"
            class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
          >
            <!-- ID -->
            <td class="px-5 py-4 sm:px-6">
              <span class="font-mono text-theme-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded">
                {{ usuario.id }}
              </span>
            </td>

            <!-- Nombre -->
            <td class="px-5 py-4 sm:px-6">
              <span class="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                {{ usuario.nombre }}
              </span>
            </td>

            <!-- Correo -->
            <td class="px-5 py-4 sm:px-6">
              <span class="text-gray-500 text-theme-sm dark:text-gray-400">{{ usuario.correo }}</span>
            </td>

            <!-- Fecha -->
            <td class="px-5 py-4 sm:px-6">
              <span class="text-gray-500 text-theme-sm dark:text-gray-400">{{ usuario.fecha }}</span>
            </td>

            <!-- Rol -->
            <td class="px-5 py-4 sm:px-6">
              <span
                :class="[
                  'rounded-full px-2.5 py-0.5 text-theme-xs font-medium',
                  (usuario.rol === 'Admin' || usuario.rol === 'Administrador')
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
                    : (usuario.rol === 'Editor' || usuario.rol === 'Operativo')
                    ? 'bg-blue-light-50 text-blue-light-700 dark:bg-blue-light-500/15 dark:text-blue-light-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                ]"
              >
                {{ usuario.rol }}
              </span>
            </td>

            <!-- Acciones -->
            <td class="px-5 py-4 sm:px-6">
              <div class="flex items-center gap-1">
                <!-- Editar -->
                <button
                  title="Editar"
                  @click="$emit('editar', usuario)"
                  class="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-blue-light-50 hover:text-blue-light-500 dark:text-gray-400 dark:hover:bg-blue-light-500/10 dark:hover:text-blue-light-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <!-- Eliminar -->
                <button
                  title="Eliminar"
                  @click="$emit('eliminar', usuario)"
                  class="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-error-50 hover:text-error-500 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="usuarios.length === 0">
            <td colspan="6" class="px-5 py-12 text-center">
              <p class="text-sm text-gray-400 dark:text-gray-500">No hay usuarios registrados.</p>
            </td>
          </tr>
        </tbody>
  </table>
</div>
</template>

<script setup>
defineProps({
  usuarios: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['editar', 'eliminar']);
</script>
