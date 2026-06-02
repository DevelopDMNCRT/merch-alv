<template>
  <AdminLayout>
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-white/90">Estadísticas Live</h1>
      </div>

      <!-- Full Width Live Card -->
      <div class="w-full rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        
        <div class="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-transparent flex items-center gap-3">
          <div class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-success-500"></span>
          </div>
          <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Monitor en Tiempo Real</h2>
        </div>

        <div v-if="loading" class="p-12 text-center">
          <svg class="animate-spin mx-auto h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">Cargando datos...</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-800">
          
          <!-- Pedidos Nuevos -->
          <div class="p-8 flex flex-col items-center text-center justify-center">
            <div class="w-12 h-12 rounded-full bg-blue-light-50 dark:bg-blue-light-500/10 flex items-center justify-center text-blue-light-600 dark:text-blue-light-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <h3 class="text-3xl font-bold text-gray-800 dark:text-white/90 mb-1">{{ stats.pedidosNuevos }}</h3>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Pedidos Nuevos</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">Sin atender en la tabla de pedidos</p>
          </div>

          <!-- Ingresos del Día -->
          <div class="p-8 flex flex-col items-center text-center justify-center">
            <div class="w-12 h-12 rounded-full bg-success-50 dark:bg-success-500/10 flex items-center justify-center text-success-600 dark:text-success-400 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 class="text-3xl font-bold text-gray-800 dark:text-white/90 mb-1">${{ stats.ingresosHoy.toLocaleString('es-MX') }}</h3>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">Ingresos del Día</p>
            <p class="text-xs text-gray-400 dark:text-gray-500 mt-2">Generado por ventas hoy (MXN)</p>
          </div>

          <!-- Best Seller -->
          <div class="p-8 flex flex-col items-center text-center justify-center relative">
            <div class="absolute top-4 right-4 text-warning-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            
            <template v-if="stats.bestSeller">
              <div class="w-20 h-20 rounded-xl overflow-hidden shadow-sm mb-4 border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <img :src="stats.bestSeller.imagen_principal" :alt="stats.bestSeller.nombre" class="w-full h-full object-cover" />
              </div>
              <h3 class="text-lg font-bold text-gray-800 dark:text-white/90 mb-1 truncate w-full max-w-[200px]" :title="stats.bestSeller.nombre">
                {{ stats.bestSeller.nombre }}
              </h3>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Best Seller Activo</p>
              <span class="inline-flex items-center gap-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600 dark:text-brand-400">
                {{ stats.bestSeller.vendidos }} vendidos
              </span>
            </template>
            <template v-else>
              <div class="w-20 h-20 rounded-xl mb-4 border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gray-400"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">No hay ventas registradas aún.</p>
            </template>
          </div>

        </div>
      </div>

      <!-- Gráfica de Ventas (Cardiograma) -->
      <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 class="text-base font-semibold text-gray-800 dark:text-white/90">Ventas del Mes</h2>
          
          <!-- Selectores -->
          <div class="flex items-center gap-3">
            <select v-model="selectedMes" @change="fetchChartData" class="rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent py-1.5 pl-3 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10">
              <option v-for="(m, i) in mesesNombres" :key="i" :value="i + 1">{{ m }}</option>
            </select>
            <select v-model="selectedAnio" @change="fetchChartData" class="rounded-lg border border-gray-200 dark:border-gray-700 bg-transparent py-1.5 pl-3 pr-8 text-sm font-medium text-gray-700 dark:text-gray-300 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10">
              <option v-for="a in anios" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>
        </div>

        <div class="p-6 relative min-h-[350px]">
          <div v-if="chartLoading" class="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
             <svg class="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </div>
          <VueApexCharts v-if="!chartLoading" type="area" height="350" :options="chartOptions" :series="chartSeries" />
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import AdminLayout from "@/components/layout/AdminLayout.vue";
import VueApexCharts from 'vue3-apexcharts';

// --- Info Live ---
const stats = ref({ pedidosNuevos: 0, ingresosHoy: 0, bestSeller: null });
const loading = ref(true);

const fetchStats = async () => {
  try {
    const res = await fetch('/api/estadisticas/live');
    if (res.ok) stats.value = await res.json();
  } catch (error) { console.error('Error:', error); }
  finally { loading.value = false; }
};

// --- Gráfica Cardiograma ---
const mesesNombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const today = new Date();
const selectedMes = ref(today.getMonth() + 1);
const selectedAnio = ref(today.getFullYear());
const anios = Array.from({ length: 5 }, (_, i) => today.getFullYear() - i);

const chartLoading = ref(true);
const chartSeries = ref([{ name: 'Ventas', data: [] }]);
const chartCategories = ref([]);

const fetchChartData = async () => {
  chartLoading.value = true;
  try {
    const res = await fetch(`/api/estadisticas/ventas-mes?mes=${selectedMes.value}&anio=${selectedAnio.value}`);
    if (res.ok) {
      const { datos } = await res.json();
      const diasEnMes = new Date(selectedAnio.value, selectedMes.value, 0).getDate();
      
      const labels = [];
      const values = [];
      const dataMap = {};
      datos.forEach(d => dataMap[d.dia] = d.total);
      
      for (let i = 1; i <= diasEnMes; i++) {
        labels.push(`${i} ${mesesNombres[selectedMes.value - 1].substring(0,3)}`);
        values.push(dataMap[i] || 0);
      }
      
      chartCategories.value = labels;
      chartSeries.value = [{ name: 'Ventas', data: values }];
    }
  } catch (error) { console.error('Error fetching chart:', error); }
  finally { chartLoading.value = false; }
};

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    fontFamily: 'inherit',
    toolbar: { show: false },
    zoom: { enabled: false },
    animations: { enabled: true, easing: 'easeinout', speed: 800 }
  },
  colors: ['#237650'], // Brand color
  stroke: {
    curve: 'straight', // Cardiogram feel
    width: 2
  },
  fill: {
    type: 'gradient',
    gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: chartCategories.value,
    labels: { style: { colors: '#9CA3AF' } },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false }
  },
  yaxis: {
    labels: {
      style: { colors: '#9CA3AF' },
      formatter: (value) => `$${value.toLocaleString('es-MX')}`
    }
  },
  grid: {
    borderColor: '#F3F4F6',
    strokeDashArray: 4,
    xaxis: { lines: { show: true } },
    yaxis: { lines: { show: true } }
  },
  markers: {
    size: 4,
    colors: ['#fff'],
    strokeColors: '#237650',
    strokeWidth: 2,
    hover: { size: 6 }
  },
  tooltip: {
    theme: 'light',
    y: { formatter: (val) => `$${val.toLocaleString('es-MX')} MXN` }
  }
}));

onMounted(() => {
  fetchStats();
  fetchChartData();
});

</script>
