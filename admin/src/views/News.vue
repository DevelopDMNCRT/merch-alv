<template>
  <AdminLayout>
    <div class="space-y-5 sm:space-y-6">

      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-white/90">Newsletter</h1>
        <router-link to="/news/nueva">
          <Button size="sm">
            <template #default>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Nuevo boletín
            </template>
          </Button>
        </router-link>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div v-for="stat in stats" :key="stat.label"
          class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] px-5 py-4">
          <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-1">{{ stat.label }}</p>
          <p class="text-2xl font-bold text-gray-800 dark:text-white/90">{{ stat.value }}</p>
        </div>
      </div>

      <!-- Card lista -->
      <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">

        <!-- Toolbar -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-wrap gap-3">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ total }} boletines · haz clic en <strong class="font-medium text-gray-700 dark:text-gray-300">Editar</strong> para modificar el contenido.
          </p>
          <!-- Filtro estado -->
          <div class="flex items-center gap-2">
            <button
              v-for="f in filtros" :key="f.value"
              @click="filtroActivo = f.value"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              :class="filtroActivo === f.value
                ? 'bg-brand-500 text-white'
                : 'border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'"
            >{{ f.label }}</button>
          </div>
        </div>

        <!-- Loading / Error -->
        <div v-if="loading" class="px-6 py-12 text-center">
          <p class="text-sm text-gray-400 dark:text-gray-500">Cargando boletines...</p>
        </div>
        <div v-else-if="errorMsg" class="px-6 py-12 text-center">
          <p class="text-sm text-red-400">{{ errorMsg }}</p>
        </div>

        <!-- Tabla -->
        <div v-else class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Asunto</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Estado</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Creado</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="item in filtrados" :key="item.id"
                class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">

                <!-- Asunto -->
                <td class="px-5 py-4 sm:px-6 max-w-xs">
                  <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90 truncate">{{ item.asunto || '(sin asunto)' }}</p>
                </td>

                <!-- Estado con Badge del theme -->
                <td class="px-5 py-4 sm:px-6">
                  <Badge :color="estadoColor(item.estado)" size="sm">{{ item.estado }}</Badge>
                </td>

                <!-- Fecha -->
                <td class="px-5 py-4 sm:px-6">
                  <span class="text-gray-500 text-theme-sm dark:text-gray-400">{{ fmtFecha(item.created_at) }}</span>
                </td>

                <!-- Acciones -->
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex items-center gap-1">
                    <router-link :to="`/news/${item.id}`" title="Editar"
                      class="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-blue-light-50 hover:text-blue-light-500 dark:text-gray-400 dark:hover:bg-blue-light-500/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </router-link>
                    <button title="Eliminar" @click="eliminar(item.id)"
                      class="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-error-50 hover:text-error-500 dark:text-gray-400 dark:hover:bg-error-500/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="filtrados.length === 0">
                <td colspan="4" class="px-5 py-12 text-center">
                  <p class="text-sm text-gray-400 dark:text-gray-500">
                    {{ filtroActivo === 'todos' ? 'No hay boletines. Crea el primero.' : `No hay boletines con estado "${filtroActivo}".` }}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';

const boletines  = ref([]);
const loading    = ref(true);
const errorMsg   = ref('');
const filtroActivo = ref('todos');

const filtros = [
  { label: 'Todos',      value: 'todos' },
  { label: 'Borrador',   value: 'Borrador' },
  { label: 'Programado', value: 'Programado' },
  { label: 'Enviado',    value: 'Enviado' },
];

const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
const fmtFecha = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2,'0')} ${meses[d.getMonth()]} ${d.getFullYear()}`;
};

const estadoColor = (e) => ({ Enviado: 'success', Borrador: 'light', Programado: 'warning' }[e] ?? 'light');

const cargar = async () => {
  loading.value = true; errorMsg.value = '';
  try {
    const res = await fetch('/api/boletines');
    if (!res.ok) throw new Error('Error al cargar boletines');
    boletines.value = await res.json();
  } catch (err) {
    errorMsg.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(cargar);

const total     = computed(() => boletines.value.length);
const filtrados = computed(() =>
  filtroActivo.value === 'todos'
    ? boletines.value
    : boletines.value.filter(b => b.estado === filtroActivo.value)
);

const stats = computed(() => [
  { label: 'Total',      value: boletines.value.length },
  { label: 'Borradores', value: boletines.value.filter(b => b.estado === 'Borrador').length },
  { label: 'Programados',value: boletines.value.filter(b => b.estado === 'Programado').length },
  { label: 'Enviados',   value: boletines.value.filter(b => b.estado === 'Enviado').length },
]);

const eliminar = async (id) => {
  if (!confirm('¿Eliminar este boletín permanentemente?')) return;
  try {
    const res = await fetch(`/api/boletines/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    boletines.value = boletines.value.filter(b => b.id !== id);
  } catch {
    alert('Error al eliminar el boletín.');
  }
};
</script>
