<template>
  <AdminLayout>
    <div class="space-y-5 sm:space-y-6">

      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-white/90">Tickets de Soporte</h1>
        <span class="flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400">
          {{ tickets.length }} tickets pendientes
        </span>
      </div>

      <!-- Card -->
      <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        
        <!-- Filter Tabs -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex-wrap gap-3">
          <div class="flex items-center gap-1">
            <button v-for="tab in tabs" :key="tab.key" @click="filtroActivo = tab.key"
              :class="[
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filtroActivo === tab.key
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              ]">
              {{ tab.label }}
              <span class="ml-1 text-xs opacity-60">({{ conteo(tab.key) }})</span>
            </button>
          </div>
          
          <!-- Search -->
          <div class="relative">
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="busqueda" type="text" placeholder="Buscar por cliente o asunto..."
              class="pl-9 pr-4 py-2 h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-500/10 w-64" />
          </div>
        </div>

        <!-- Table -->
        <div class="max-w-full overflow-x-auto custom-scrollbar">
          <table class="min-w-full">
            <thead>
              <tr class="border-b border-gray-200 dark:border-gray-700">
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Ticket</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Cliente</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Asunto</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Prioridad</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Estado</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Fecha</p></th>
                <th class="px-5 py-3 text-left sm:px-6"><p class="font-medium text-gray-500 text-theme-xs dark:text-gray-400">Acciones</p></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
              <tr v-for="t in ticketsFiltrados" :key="t.id" class="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                <td class="px-5 py-4 sm:px-6">
                  <span class="font-semibold text-gray-800 text-theme-sm dark:text-white/90">#{{ t.num }}</span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">{{ t.cliente }}</p>
                  <p class="text-xs text-gray-400 dark:text-gray-500">{{ t.email }}</p>
                </td>
                <td class="px-5 py-4 sm:px-6 min-w-[200px]">
                  <p class="text-gray-700 text-theme-sm dark:text-gray-300">{{ t.asunto }}</p>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span :class="prioridadClase(t.prioridad)" class="rounded-full px-2.5 py-0.5 text-theme-xs font-medium border">
                    {{ t.prioridad }}
                  </span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span :class="estadoClase(t.estado)" class="rounded-full px-2.5 py-0.5 text-theme-xs font-medium">
                    {{ t.estado }}
                  </span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <span class="text-gray-500 text-theme-sm dark:text-gray-400">{{ t.fecha }}</span>
                </td>
                <td class="px-5 py-4 sm:px-6">
                  <div class="flex items-center gap-1">
                    <router-link :to="`/tickets/${t.id}`" title="Ver detalle / Responder"
                      class="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-blue-light-50 hover:text-blue-light-500 dark:text-gray-400 dark:hover:bg-blue-light-500/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </router-link>
                    <button @click="cerrarTicket(t.id)" title="Cerrar Ticket" v-if="t.estado !== 'Cerrado'"
                      class="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-success-50 hover:text-success-500 dark:text-gray-400 dark:hover:bg-success-500/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </button>
                    <button @click="eliminar(t.id)" title="Eliminar"
                      class="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-error-50 hover:text-error-500 dark:text-gray-400 dark:hover:bg-error-500/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="ticketsFiltrados.length === 0">
                <td colspan="7" class="px-5 py-12 text-center"><p class="text-sm text-gray-400 dark:text-gray-500">No hay tickets que coincidan con tu búsqueda.</p></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed } from 'vue';
import AdminLayout from '@/components/layout/AdminLayout.vue';

const filtroActivo = ref('abiertos');
const busqueda     = ref('');

const tabs = [
  { key: 'abiertos', label: 'Abiertos' },
  { key: 'proceso',  label: 'En Proceso' },
  { key: 'cerrados', label: 'Cerrados' },
  { key: 'todos',    label: 'Todos' },
];

const tickets = ref([
  { id: 1, num: '1024', cliente: 'Roberto Gómez', email: 'roberto@gmail.com', asunto: 'No he recibido mi número de rastreo', prioridad: 'Alta',  estado: 'Abierto',    fecha: '23 Abr 2025' },
  { id: 2, num: '1025', cliente: 'Lucía Méndez',  email: 'lucia.m@outlook.com', asunto: 'Cambio de talla en mi pedido #00123', prioridad: 'Media', estado: 'En Proceso', fecha: '22 Abr 2025' },
  { id: 3, num: '1026', cliente: 'Juan Pérez',    email: 'jperez@live.com',    asunto: 'Error en el portal de facturación', prioridad: 'Baja',  estado: 'Abierto',    fecha: '23 Abr 2025' },
  { id: 4, num: '1020', cliente: 'Ana Sofía',     email: 'anas@gmail.com',     asunto: 'Duda sobre envíos internacionales', prioridad: 'Baja',  estado: 'Cerrado',    fecha: '15 Abr 2025' },
  { id: 5, num: '1027', cliente: 'Carlos Ruiz',   email: 'cruiz@merch.mx',     asunto: 'Cotización para merch de gira',    prioridad: 'Alta',  estado: 'Abierto',    fecha: '23 Abr 2025' },
]);

const conteo = (key) => {
  if (key === 'todos') return tickets.value.length;
  if (key === 'abiertos') return tickets.value.filter(t => t.estado === 'Abierto').length;
  if (key === 'proceso')  return tickets.value.filter(t => t.estado === 'En Proceso').length;
  if (key === 'cerrados') return tickets.value.filter(t => t.estado === 'Cerrado').length;
  return 0;
};

const ticketsFiltrados = computed(() => {
  let lista = tickets.value;
  if (filtroActivo.value === 'abiertos') lista = lista.filter(t => t.estado === 'Abierto');
  if (filtroActivo.value === 'proceso')  lista = lista.filter(t => t.estado === 'En Proceso');
  if (filtroActivo.value === 'cerrados') lista = lista.filter(t => t.estado === 'Cerrado');
  
  if (busqueda.value) {
    const q = busqueda.value.toLowerCase();
    lista = lista.filter(t => t.cliente.toLowerCase().includes(q) || t.asunto.toLowerCase().includes(q) || t.num.includes(q));
  }
  return lista;
});

const prioridadClase = (p) => {
  if (p === 'Alta')  return 'bg-error-50 text-error-700 border-error-100 dark:bg-error-500/10 dark:text-error-500 dark:border-error-500/20';
  if (p === 'Media') return 'bg-warning-50 text-warning-700 border-warning-100 dark:bg-warning-500/10 dark:text-warning-400 dark:border-warning-500/20';
  return 'bg-blue-light-50 text-blue-light-700 border-blue-light-100 dark:bg-blue-light-500/10 dark:text-blue-light-400 dark:border-blue-light-500/20';
};

const estadoClase = (e) => {
  if (e === 'Abierto')    return 'bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-500';
  if (e === 'En Proceso') return 'bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400';
  if (e === 'Cerrado')    return 'bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500';
  return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
};

const cerrarTicket = (id) => {
  const t = tickets.value.find(x => x.id === id);
  if (t) t.estado = 'Cerrado';
};

const eliminar = (id) => {
  if (confirm('¿Eliminar este ticket?')) tickets.value = tickets.value.filter(t => t.id !== id);
};
</script>
