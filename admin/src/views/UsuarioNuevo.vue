<template>
  <AdminLayout>
    <div class="space-y-5 sm:space-y-6">

      <!-- Page Header -->
      <div class="flex items-center gap-3">
        <router-link
          to="/usuarios"
          class="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </router-link>
        <h1 class="text-xl font-semibold text-gray-800 dark:text-white/90">
          {{ isEditing ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </h1>
      </div>

      <!-- Loading state -->
      <div v-if="loadingUser" class="flex items-center justify-center py-20">
        <svg class="animate-spin h-8 w-8 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
        </svg>
      </div>

      <!-- Form Card -->
      <div v-else class="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <form @submit.prevent="guardar" class="divide-y divide-gray-100 dark:divide-gray-800">

          <div class="px-6 py-8">
            <div class="grid grid-cols-12 gap-6">

              <!-- Nombre -->
              <div class="col-span-12 sm:col-span-6">
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Nombre <span class="text-error-500">*</span>
                </label>
                <input
                  v-model="form.nombre"
                  type="text"
                  placeholder="Nombre completo"
                  required
                  class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              <!-- Correo -->
              <div class="col-span-12 sm:col-span-6">
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Correo <span class="text-error-500">*</span>
                </label>
                <input
                  v-model="form.correo"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  required
                  class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                />
              </div>

              <!-- Rol -->
              <div class="col-span-12 sm:col-span-4">
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Rol <span class="text-error-500">*</span>
                </label>
                <div class="relative">
                  <select
                    v-model="form.rol"
                    required
                    class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                  >
                    <option value="" disabled>Seleccionar rol</option>
                    <option value="Operativo">Operativo</option>
                    <option value="Administrador">Administrador</option>
                    <option value="Socio">Socio</option>
                  </select>
                  <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </div>
              </div>

              <!-- Tiendas Permitidas (Solo para Rol Socio - Search Combobox) -->
              <div v-if="form.rol === 'Socio'" class="col-span-12" id="tiendas-combobox-container">
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Tiendas / Artistas Autorizados <span class="text-error-500">*</span>
                </label>
                
                <div class="relative">
                  <!-- Search & Selected Badges Input Box -->
                  <div 
                    class="min-h-[46px] w-full rounded-xl border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900 p-2 text-sm focus-within:border-brand-300 focus-within:ring-3 focus-within:ring-brand-500/10 transition-colors flex flex-wrap items-center gap-1.5 cursor-text"
                    @click="focusSearchInput"
                  >
                    <!-- Selected Chips -->
                    <span 
                      v-for="tienda in tiendasSeleccionadasObjetos" 
                      :key="tienda.id" 
                      class="inline-flex items-center gap-1.5 bg-brand-500/10 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300 text-xs font-semibold px-2.5 py-1 rounded-lg border border-brand-500/20"
                    >
                      {{ tienda.nombre }}
                      <button 
                        type="button" 
                        @click.stop="toggleTiendaSelection(tienda.id)" 
                        class="hover:text-red-500 transition-colors"
                        title="Eliminar tienda"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </span>

                    <!-- Search Text Input -->
                    <div class="flex-1 min-w-[180px] flex items-center gap-2 px-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400 shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <input 
                        ref="searchInputRef"
                        type="text" 
                        v-model="searchQuery" 
                        @focus="showDropdown = true"
                        placeholder="Buscar o seleccionar tienda / artista..." 
                        class="w-full bg-transparent border-none p-0 text-sm text-gray-800 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-0"
                      />
                    </div>
                  </div>

                  <!-- Dropdown Panel -->
                  <div 
                    v-if="showDropdown" 
                    class="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 shadow-xl overflow-hidden max-h-60 flex flex-col"
                  >
                    <!-- Header Actions inside Dropdown -->
                    <div class="px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50 text-xs">
                      <span class="font-medium text-gray-500 dark:text-gray-400">
                        {{ selectedTiendaIds.length }} de {{ tiendasDisponibles.length }} seleccionadas
                      </span>
                      <button 
                        type="button" 
                        @click="toggleTodasTiendas" 
                        class="font-semibold text-brand-500 hover:underline"
                      >
                        {{ seleccionadasTodas ? 'Desmarcar todas' : 'Seleccionar todas' }}
                      </button>
                    </div>

                    <!-- Dropdown Options List -->
                    <div class="overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700/50 max-h-48">
                      <div 
                        v-for="t in tiendasFiltradas" 
                        :key="t.id" 
                        @click="toggleTiendaSelection(t.id)"
                        class="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
                        :class="{'bg-brand-500/5 dark:bg-brand-500/10': selectedTiendaIds.includes(t.id)}"
                      >
                        <span class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ t.nombre }}</span>
                        <div class="flex items-center">
                          <input 
                            type="checkbox" 
                            :checked="selectedTiendaIds.includes(t.id)" 
                            class="rounded border-gray-300 text-brand-500 focus:ring-brand-500/20 pointer-events-none"
                          />
                        </div>
                      </div>
                      <div v-if="tiendasFiltradas.length === 0" class="px-4 py-4 text-center text-xs text-gray-400">
                        No se encontraron tiendas que coincidan con "{{ searchQuery }}"
                      </div>
                    </div>
                  </div>
                </div>

                <p v-if="selectedTiendaIds.length === 0" class="mt-1.5 text-xs text-error-500 font-medium">Debe seleccionar al menos una tienda para el rol Socio.</p>
              </div>

              <!-- Contraseña -->
              <div class="col-span-12 sm:col-span-4">
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Contraseña <span v-if="!isEditing" class="text-error-500">*</span>
                  <span v-else class="text-gray-400 font-normal text-xs"> (dejar vacío para no cambiar)</span>
                </label>
                <div class="relative">
                  <input
                    v-model="form.password"
                    :type="showPass ? 'text' : 'password'"
                    placeholder="Mínimo 8 caracteres"
                    :required="!isEditing"
                    :minlength="form.password.length > 0 ? 8 : undefined"
                    class="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 pr-11 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                  />
                  <button type="button" @click="showPass = !showPass" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <svg v-if="!showPass" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
              </div>

              <!-- Confirmar Contraseña -->
              <div class="col-span-12 sm:col-span-4">
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Confirmar Contraseña <span v-if="!isEditing" class="text-error-500">*</span>
                </label>
                <div class="relative">
                  <input
                    v-model="form.confirmar"
                    :type="showConfirm ? 'text' : 'password'"
                    placeholder="Repite la contraseña"
                    :required="!isEditing && form.password.length > 0"
                    class="h-11 w-full rounded-lg border bg-transparent px-4 pr-11 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-none focus:ring-3 transition-colors"
                    :class="passwordError
                      ? 'border-error-400 text-error-600 focus:border-error-400 focus:ring-error-400/10 dark:border-error-500 dark:text-error-400'
                      : 'border-gray-300 text-gray-800 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:text-white/90 dark:focus:border-brand-800'"
                  />
                  <button type="button" @click="showConfirm = !showConfirm" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                    <svg v-if="!showPass" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  </button>
                </div>
                <p v-if="passwordError" class="mt-1.5 text-xs text-error-500">Las contraseñas no coinciden.</p>
              </div>

            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end gap-3 px-6 py-4">
            <router-link
              to="/usuarios"
              class="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </router-link>
            <button
              type="submit"
              :disabled="loading || !!passwordError || (form.rol === 'Socio' && selectedTiendaIds.length === 0)"
              class="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ loading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Guardar Usuario' }}
            </button>
          </div>

        </form>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';
import axios from 'axios';

const router = useRouter();
const route  = useRoute();

const isEditing  = computed(() => !!route.params.id);
const showPass   = ref(false);
const showConfirm = ref(false);
const loading    = ref(false);
const loadingUser = ref(false);

const tiendasDisponibles = ref([]);
const selectedTiendaIds = ref([]);
const searchQuery = ref('');
const showDropdown = ref(false);
const searchInputRef = ref(null);

const form = reactive({
  nombre:    '',
  correo:    '',
  rol:       '',
  password:  '',
  confirmar: '',
});

const focusSearchInput = () => {
  showDropdown.value = true;
  if (searchInputRef.value) searchInputRef.value.focus();
};

const tiendasSeleccionadasObjetos = computed(() => {
  return tiendasDisponibles.value.filter(t => selectedTiendaIds.value.includes(t.id));
});

const tiendasFiltradas = computed(() => {
  if (!searchQuery.value.trim()) return tiendasDisponibles.value;
  const q = searchQuery.value.toLowerCase().trim();
  return tiendasDisponibles.value.filter(t => t.nombre.toLowerCase().includes(q));
});

const toggleTiendaSelection = (id) => {
  const idx = selectedTiendaIds.value.indexOf(id);
  if (idx === -1) {
    selectedTiendaIds.value.push(id);
  } else {
    selectedTiendaIds.value.splice(idx, 1);
  }
};

const seleccionadasTodas = computed(() =>
  tiendasDisponibles.value.length > 0 && selectedTiendaIds.value.length === tiendasDisponibles.value.length
);

const toggleTodasTiendas = () => {
  if (seleccionadasTodas.value) {
    selectedTiendaIds.value = [];
  } else {
    selectedTiendaIds.value = tiendasDisponibles.value.map(t => t.id);
  }
};

const handleDocumentClick = (e) => {
  const container = document.getElementById('tiendas-combobox-container');
  if (container && !container.contains(e.target)) {
    showDropdown.value = false;
  }
};

onMounted(async () => {
  document.addEventListener('click', handleDocumentClick);

  try {
    const resT = await axios.get('/api/tiendas');
    tiendasDisponibles.value = resT.data;
  } catch (err) {
    console.error('Error al cargar tiendas:', err);
  }

  if (!isEditing.value) return;
  loadingUser.value = true;
  try {
    const res = await axios.get(`/api/users/${route.params.id}`);
    form.nombre = res.data.nombre;
    form.correo = res.data.correo;
    form.rol    = res.data.rol;
    if (res.data.tiendas_ids) {
      selectedTiendaIds.value = res.data.tiendas_ids.split(',').map(x => Number(x.trim())).filter(Boolean);
    }
  } catch (err) {
    console.error('Error loading user:', err);
    alert('No se pudo cargar el usuario');
    router.push('/usuarios');
  } finally {
    loadingUser.value = false;
  }
});

onUnmounted(() => {
  document.removeEventListener('click', handleDocumentClick);
});

const passwordError = computed(() => {
  if (form.password.length === 0 && isEditing.value) return null;
  return form.confirmar.length > 0 && form.password !== form.confirmar
    ? 'Las contraseñas no coinciden'
    : null;
});

const guardar = async () => {
  if (passwordError.value) return;
  if (form.rol === 'Socio' && selectedTiendaIds.value.length === 0) {
    alert('Debes seleccionar al menos una tienda para el usuario Socio.');
    return;
  }

  loading.value = true;
  try {
    const payload = {
      nombre:      form.nombre,
      correo:      form.correo,
      rol:         form.rol,
      tiendas_ids: form.rol === 'Socio' ? selectedTiendaIds.value.join(',') : '',
    };

    if (isEditing.value) {
      if (form.password.length > 0) {
        payload.password = form.password;
      }
      await axios.put(`/api/users/${route.params.id}`, payload);
    } else {
      payload.password = form.password;
      await axios.post('/api/users', payload);
    }
    router.push('/usuarios');
  } catch (err) {
    console.error('Error saving user:', err);
    alert(err.response?.data?.error || 'Error al guardar el usuario');
  } finally {
    loading.value = false;
  }
};
</script>
