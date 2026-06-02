<template>
  <AdminLayout>
    <div class="space-y-5 sm:space-y-6" v-if="pedido">

      <!-- Header -->
      <div class="flex items-center gap-3">
        <router-link
          to="/pedidos"
          class="flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </router-link>
        <h1 class="text-xl font-semibold text-gray-800 dark:text-white/90">
          Pedido <span class="text-brand-500 font-mono">#{{ pedido.orden }}</span>
        </h1>
      </div>

      <!-- Two-column layout -->
      <div class="grid grid-cols-12 gap-5 items-start">

        <!-- ═══ LEFT CARD: Datos del pedido ═══ -->
        <div class="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
            <h2 class="text-base font-semibold text-gray-800 dark:text-white/90">Información del Pedido</h2>
          </div>

          <div class="px-6 py-6 space-y-6">

            <!-- Fila 1: # Orden, Cliente, Fecha, Total -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <div>
                <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">Orden</p>
                <p class="font-mono font-bold text-brand-600 dark:text-brand-400 text-sm">#{{ pedido.orden }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">Cliente</p>
                <p class="font-medium text-gray-800 dark:text-white/90 text-sm">{{ pedido.cliente }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">Fecha</p>
                <p class="text-gray-600 dark:text-gray-400 text-sm">{{ pedido.fecha }}</p>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">Total</p>
                <p class="font-bold text-gray-800 dark:text-white/90 text-sm">${{ pedido.total.toLocaleString('es-MX') }} MXN</p>
              </div>
            </div>

            <div class="border-t border-gray-100 dark:border-gray-800" />

            <!-- Fila 2: Estado, Correo, Teléfono, Ver Mapa -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <!-- Estado dropdown + botón guardar -->
              <div>
                <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1.5">Estado</p>
                <div class="flex flex-col gap-2">
                  <!-- Select -->
                  <div class="relative">
                    <select
                      v-model="estadoPendiente"
                      class="w-full appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent py-2 pl-3 pr-8 text-sm font-medium focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                      :class="estadoTextClase(estadoPendiente)"
                    >
                      <option value="Nuevo">Nuevo</option>
                      <option value="En proceso">En proceso</option>
                      <option value="Completado">Completado</option>
                      <option value="Fallido">Fallido</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                    <span class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </span>
                  </div>

                  <!-- Email indicator -->
                  <div v-if="estadoTriggerEmail" class="flex items-center gap-1.5 rounded-md bg-blue-light-50 dark:bg-blue-light-500/10 px-2.5 py-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-light-500 flex-shrink-0"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    <span class="text-xs font-medium text-blue-light-600 dark:text-blue-light-400">Se enviará correo al cliente</span>
                  </div>

                  <!-- Botón guardar -->
                  <button
                    @click="guardarEstado"
                    :disabled="savingEstado || estadoPendiente === pedido.estado"
                    class="flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                    :class="estadoPendiente !== pedido.estado
                      ? 'bg-brand-500 text-white hover:bg-brand-600'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'"
                  >
                    <svg v-if="savingEstado" class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 0 0-9-9"/><circle cx="12" cy="12" r="9" stroke-opacity="0.3"/></svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {{ savingEstado ? 'Guardando...' : 'Guardar estado' }}
                  </button>
                </div>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">Correo</p>
                <a :href="`mailto:${pedido.correo}`" class="text-sm text-brand-500 hover:text-brand-600 dark:text-brand-400 break-all">
                  {{ pedido.correo }}
                </a>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">Teléfono</p>
                <a :href="`tel:${pedido.telefono}`" class="text-sm text-gray-700 dark:text-gray-300 hover:text-brand-500">
                  {{ pedido.telefono }}
                </a>
              </div>
              <div>
                <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1">Ubicación</p>
                <a
                  :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pedido.domicilio)}`"
                  target="_blank"
                  class="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-600 dark:text-brand-400"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  Ver Mapa
                </a>
              </div>
            </div>

            <div class="border-t border-gray-100 dark:border-gray-800" />

            <!-- Fila 3: Domicilio completo -->
            <div>
              <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1.5">Domicilio de entrega</p>
              <p class="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{{ pedido.domicilio }}</p>
            </div>

            <div class="border-t border-gray-100 dark:border-gray-800" />

            <!-- Notas del cliente -->
            <div>
              <p class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase mb-1.5 block">Notas del cliente</p>
              <div
                v-if="pedido.nota"
                class="w-full rounded-lg border border-warning-200 dark:border-warning-500/30 bg-warning-50 dark:bg-warning-500/10 px-4 py-3 text-sm text-warning-800 dark:text-warning-300 leading-relaxed"
              >
                {{ pedido.nota }}
              </div>
              <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic">Sin notas.</p>
            </div>

          </div>
        </div>

        <!-- ═══ RIGHT CARD: Resumen de productos ═══ -->
        <div class="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 class="text-base font-semibold text-gray-800 dark:text-white/90">Productos</h2>
            <span class="rounded-full bg-brand-50 dark:bg-brand-500/15 text-brand-600 dark:text-brand-400 text-xs font-semibold px-2.5 py-0.5">
              {{ totalItems }} artículos
            </span>
          </div>

          <!-- Lista de productos -->
          <div class="divide-y divide-gray-100 dark:divide-gray-800 max-h-80 overflow-y-auto custom-scrollbar">
            <div
              v-for="item in pedido.items"
              :key="item.id"
              class="flex gap-3 px-5 py-4"
            >
              <div class="w-14 h-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <img :src="item.imagen" :alt="item.nombre" class="w-full h-full object-cover" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{{ item.nombre }}</p>
                <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ item.variante }}</p>
                <div class="flex items-center justify-between mt-1.5">
                  <span class="text-xs text-gray-500 dark:text-gray-400">Cant: {{ item.cantidad }}</span>
                  <span class="text-sm font-semibold text-gray-800 dark:text-white/90">
                    ${{ (item.precio * item.cantidad).toLocaleString('es-MX') }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Totales -->
          <div class="px-5 py-4 border-t border-gray-100 dark:border-gray-800 space-y-2.5">
            <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Subtotal</span>
              <span>${{ subtotal.toLocaleString('es-MX') }} MXN</span>
            </div>
            <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Envío</span>
              <span v-if="pedido.envio === 0" class="text-success-600 dark:text-success-500 font-medium">Gratis</span>
              <span v-else>${{ pedido.envio.toLocaleString('es-MX') }} MXN</span>
            </div>
            <div class="border-t border-gray-100 dark:border-gray-800 pt-2.5 flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-800 dark:text-white/90">Total</span>
              <span class="text-base font-bold text-brand-600 dark:text-brand-400">
                ${{ pedido.total.toLocaleString('es-MX') }} MXN
              </span>
            </div>
          </div>
        </div>

        <!-- ═══ LOGÍSTICA Y ENVÍOS (Envia.com) ═══ -->
        <div class="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] mt-5 lg:mt-0">
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 class="text-base font-semibold text-gray-800 dark:text-white/90 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-brand-500"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              Logística (Envia.com)
            </h2>
          </div>

          <div class="px-5 py-6">
            <!-- Caso 1: Ya tiene guía -->
            <div v-if="pedido.tracking_number" class="flex flex-col gap-4">
              <div class="flex flex-col items-center justify-center p-4 rounded-xl border border-success-200 bg-success-50 dark:border-success-500/20 dark:bg-success-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-success-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p class="text-sm font-medium text-success-800 dark:text-success-400">Guía Generada</p>
                <p class="text-lg font-bold font-mono text-gray-900 dark:text-white mt-1">{{ pedido.tracking_number }}</p>
              </div>
              <a :href="pedido.guia_url" target="_blank" class="w-full flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                Imprimir PDF
              </a>
            </div>

            <!-- Caso 2: No tiene guía -->
            <div v-else class="flex flex-col gap-4">
              <p class="text-sm text-gray-600 dark:text-gray-400">Aún no se ha generado guía para este pedido.</p>
              
              <button @click="cotizarEnvio" :disabled="cotizandoEnvio || rates.length > 0" class="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <svg v-if="cotizandoEnvio" class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 0 0-9-9"/><circle cx="12" cy="12" r="9" stroke-opacity="0.3"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 16 16 12 12 8"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                {{ cotizandoEnvio ? 'Cotizando...' : 'Cotizar Opciones de Envío' }}
              </button>

              <div v-if="rates.length > 0" class="mt-4 flex flex-col gap-3">
                <p class="text-xs font-semibold text-gray-500 uppercase">Opciones Disponibles</p>
                <div class="flex flex-col gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                  <label v-for="(rate, idx) in rates" :key="idx" class="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors" :class="selectedRate?.carrier === rate.carrier && selectedRate?.service === rate.service ? 'border-brand-500 bg-brand-50 dark:bg-brand-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'">
                    <input type="radio" name="rate" :value="rate" v-model="selectedRate" class="mt-1 text-brand-500 focus:ring-brand-500" />
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-center">
                        <span class="font-semibold text-gray-900 dark:text-white capitalize text-sm">{{ rate.carrierDescription || rate.carrier }}</span>
                        <span class="font-bold text-brand-600 dark:text-brand-400">${{ rate.totalPrice.toLocaleString('es-MX') }}</span>
                      </div>
                      <p class="text-xs text-gray-500 truncate mt-0.5">{{ rate.serviceDescription || rate.service }}</p>
                      <p class="text-xs text-brand-500 mt-1 font-medium">Llega en: {{ rate.deliveryEstimate }}</p>
                    </div>
                  </label>
                </div>

                <button @click="generarGuia" :disabled="!selectedRate || generandoGuia" class="mt-2 w-full flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg v-if="generandoGuia" class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 12a9 9 0 0 0-9-9"/><circle cx="12" cy="12" r="9" stroke-opacity="0.3"/></svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ generandoGuia ? 'Generando Guía...' : 'Generar Guía Oficial' }}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Not found -->
    <div v-else class="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <p class="text-lg font-medium text-gray-600 dark:text-gray-400">Pedido no encontrado.</p>
      <router-link to="/pedidos" class="mt-4 text-sm text-brand-500 hover:text-brand-600">← Volver a Pedidos</router-link>
    </div>
  </AdminLayout>

  <!-- Toast de confirmación -->
  <Teleport to="body">
    <transition name="toast-slide">
      <div v-if="toast.show" class="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-xl text-sm font-medium"
        :class="toast.type === 'success' ? 'bg-success-500 text-white' : 'bg-error-500 text-white'"
      >
        <svg v-if="toast.type === 'success'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        {{ toast.msg }}
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AdminLayout from '@/components/layout/AdminLayout.vue';

const route = useRoute();
const pedido = ref(null);
const loading = ref(true);

// Estados que disparan correo al cliente (debe coincidir con EMAIL_TRIGGERS en el server)
const EMAIL_STATES = new Set(['En proceso', 'Completado', 'Cancelado', 'Fallido']);

// Estado local pendiente de guardar
const estadoPendiente = ref('');
const savingEstado    = ref(false);
const toast = ref({ show: false, type: 'success', msg: '' });

// Envia.com states
const cotizandoEnvio = ref(false);
const generandoGuia = ref(false);
const rates = ref([]);
const selectedRate = ref(null);

function showToast(type, msg) {
  toast.value = { show: true, type, msg };
  setTimeout(() => { toast.value.show = false; }, 3500);
}

const estadoTriggerEmail = computed(() => EMAIL_STATES.has(estadoPendiente.value));

const fetchPedido = async () => {
  try {
    const res = await fetch(`/api/pedidos/${route.params.id}`);
    if (!res.ok) throw new Error('Pedido no encontrado');
    const data = await res.json();
    
    const d = new Date(data.created_at);
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const fechaFormateada = `${d.getDate().toString().padStart(2,'0')} ${meses[d.getMonth()]} ${d.getFullYear()}`;

    pedido.value = {
      id: data.id,
      orden: data.orden,
      cliente: data.nombre,
      fecha: fechaFormateada,
      ciudad: data.ciudad,
      estado: data.estado,
      correo: data.correo,
      telefono: data.telefono,
      domicilio: data.domicilio,
      nota: data.notas,
      items: data.items || [],
      envio: parseFloat(data.envio),
      total: parseFloat(data.total),
      tracking_number: data.tracking_number,
      guia_url: data.guia_url
    };
    // Inicializar el estado pendiente con el valor guardado en BD
    estadoPendiente.value = data.estado;
  } catch (error) {
    console.error('Error fetching pedido:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchPedido();
});

const guardarEstado = async () => {
  if (!pedido.value || savingEstado.value) return;
  if (estadoPendiente.value === pedido.value.estado) return;
  savingEstado.value = true;
  try {
    const res = await fetch(`/api/pedidos/${pedido.value.id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: estadoPendiente.value })
    });
    if (!res.ok) throw new Error('Error al actualizar el estado');
    const data = await res.json();
    // Actualizar el estado guardado localmente
    pedido.value.estado = estadoPendiente.value;
    const emailMsg = data.emailEnviado ? ' · Correo enviado al cliente ✓' : '';
    showToast('success', `Estado actualizado a "${estadoPendiente.value}"${emailMsg}`);
  } catch (error) {
    console.error('Error updating status:', error);
    // Rollback visual
    estadoPendiente.value = pedido.value.estado;
    showToast('error', 'Error al guardar el estado. Intenta nuevamente.');
  } finally {
    savingEstado.value = false;
  }
};

const cotizarEnvio = async () => {
  if (!pedido.value) return;
  cotizandoEnvio.value = true;
  rates.value = [];
  selectedRate.value = null;
  try {
    const res = await fetch(`/api/pedidos/${pedido.value.id}/cotizar-envio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al cotizar');
    
    if (data.rates && data.rates.length > 0) {
      // Filtrar y ordenar por precio
      rates.value = data.rates.sort((a, b) => a.totalPrice - b.totalPrice);
      showToast('success', `${rates.value.length} opciones encontradas.`);
    } else {
      showToast('error', 'No se encontraron tarifas para este código postal.');
    }
  } catch (err) {
    console.error(err);
    showToast('error', err.message);
  } finally {
    cotizandoEnvio.value = false;
  }
};

const generarGuia = async () => {
  if (!pedido.value || !selectedRate.value) return;
  generandoGuia.value = true;
  try {
    const payload = {
      carrier: selectedRate.value.carrier,
      service: selectedRate.value.service
    };
    const res = await fetch(`/api/pedidos/${pedido.value.id}/generar-guia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al generar la guía');
    
    // Update local state
    pedido.value.tracking_number = data.tracking_number;
    pedido.value.guia_url = data.guia_url;
    
    showToast('success', '¡Guía generada exitosamente!');
  } catch (err) {
    console.error(err);
    showToast('error', err.message);
  } finally {
    generandoGuia.value = false;
  }
};

const totalItems = computed(() => pedido.value?.items.reduce((s, x) => s + x.cantidad, 0) ?? 0);
const subtotal   = computed(() => pedido.value?.items.reduce((s, x) => s + (x.precio * x.cantidad), 0) ?? 0);

const estadoTextClase = (estado) => {
  const m = {
    'Nuevo':      'text-blue-light-600 dark:text-blue-light-400',
    'En proceso': 'text-warning-600 dark:text-warning-400',
    'Completado': 'text-success-600 dark:text-success-500',
    'Fallido':    'text-error-600 dark:text-error-500',
    'Cancelado':  'text-gray-500 dark:text-gray-400',
  };
  return m[estado] ?? '';
};
</script>

<style scoped>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.animate-spin {
  animation: spin 0.75s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>
