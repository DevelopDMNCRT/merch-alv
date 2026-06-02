<template>
  <AdminLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-white/90">
          Envío
        </h1>
        <button
          @click="openModal"
          class="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Nueva Regla
        </button>
      </div>

      <!-- Table -->
      <div class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead class="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
              <tr>
                <th scope="col" class="px-6 py-4 font-medium">Países</th>
                <th scope="col" class="px-6 py-4 font-medium">Estados (si aplica)</th>
                <th scope="col" class="px-6 py-4 font-medium">Precio</th>
                <th scope="col" class="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="shippingRules.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-gray-500">
                  No hay reglas de envío configuradas.
                </td>
              </tr>
              <tr
                v-for="(rule, index) in shippingRules"
                :key="index"
                class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span v-for="p in rule.paises" :key="p" class="inline-flex rounded-full bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 text-xs text-blue-700 dark:text-blue-400">
                      {{ p }}
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1" v-if="rule.paises.includes('México') && rule.estados.length > 0">
                    <span v-for="e in rule.estados" :key="e" class="inline-flex rounded-full bg-green-50 dark:bg-green-500/10 px-2 py-0.5 text-xs text-green-700 dark:text-green-400">
                      {{ e }}
                    </span>
                  </div>
                  <span v-else class="text-xs text-gray-400">N/A o Todo el país</span>
                </td>
                <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                  ${{ Number(rule.precio).toFixed(2) }}
                </td>
                <td class="px-6 py-4 text-right">
                  <button @click="removeRule(index)" class="text-red-500 hover:text-red-700">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 transition-opacity">
      <div class="w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl" @click.stop>
        <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-5">Agregar Regla de Envío</h2>
        
        <form @submit.prevent="saveRule" class="space-y-5">
          <!-- Países -->
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Países</label>
            <MultiSelect
              v-model="form.paises"
              :options="countryList"
              placeholder="Buscar país..."
            />
          </div>

          <!-- Estados (Sólo si selecciona México) -->
          <div v-if="form.paises.includes('México')" class="animate-fade-in">
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Estados (Opcional)</label>
            <MultiSelect
              v-model="form.estados"
              :options="stateList"
              placeholder="Buscar estado..."
            />
            <p class="mt-1 text-xs text-gray-500">Si no seleccionas ninguno, aplicará a todo México.</p>
          </div>

          <!-- Precio -->
          <div>
            <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Precio de Envío</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                v-model="form.precio"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                class="w-full h-11 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent pl-8 pr-4 text-sm text-gray-900 dark:text-white/90 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-5">
            <button
              type="button"
              @click="closeModal"
              class="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
            >
              Guardar Regla
            </button>
          </div>
        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import MultiSelect from '@/components/ui/MultiSelect.vue';

const countryList = [
  'México', 'Estados Unidos', 'Canadá', 'España', 
  'Argentina', 'Colombia', 'Chile', 'Perú', 'Ecuador', 
  'Resto del mundo'
];

const stateList = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche', 
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 
  'Durango', 'Estado de México', 'Guanajuato', 'Guerrero', 'Hidalgo', 
  'Jalisco', 'Michoacán', 'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 
  'Puebla', 'Querétaro', 'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 
  'Sonora', 'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 
  'Zacatecas'
];

const shippingRules = ref<any[]>([]);
const isModalOpen = ref(false);

const form = reactive({
  paises: [] as string[],
  estados: [] as string[],
  precio: ''
});

const fetchRules = async () => {
  try {
    const res = await axios.get('/api/shipping-rules');
    shippingRules.value = res.data;
  } catch (error) {
    console.error('Error fetching shipping rules:', error);
  }
};

onMounted(() => {
  fetchRules();
});

const openModal = () => {
  form.paises = [];
  form.estados = [];
  form.precio = '';
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const saveRule = async () => {
  if (form.paises.length === 0) {
    alert('Por favor selecciona al menos un país.');
    return;
  }
  
  try {
    const payload = {
      paises: form.paises,
      estados: form.paises.includes('México') ? form.estados : [],
      precio: form.precio
    };
    const res = await axios.post('/api/shipping-rules', payload);
    shippingRules.value.push(res.data);
    closeModal();
  } catch (error) {
    console.error('Error saving shipping rule:', error);
    alert('Error al guardar la regla');
  }
};

const removeRule = async (index: number) => {
  const rule = shippingRules.value[index];
  if (!confirm('¿Seguro que deseas eliminar esta regla?')) return;
  try {
    await axios.delete(`/api/shipping-rules/${rule.id}`);
    shippingRules.value.splice(index, 1);
  } catch (error) {
    console.error('Error deleting rule:', error);
    alert('Error al eliminar la regla');
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
