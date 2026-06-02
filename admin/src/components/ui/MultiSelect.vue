<template>
  <div class="relative" ref="containerRef">
    <!-- Trigger -->
    <div
      class="min-h-11 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white/90 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/20 cursor-text flex flex-wrap gap-2 items-center"
      @click="openDropdown"
    >
      <!-- Selected tags -->
      <span
        v-for="item in modelValue"
        :key="item"
        class="inline-flex items-center gap-1 rounded bg-brand-50 dark:bg-brand-500/10 px-2 py-1 text-xs font-medium text-brand-700 dark:text-brand-400"
      >
        {{ item }}
        <button
          type="button"
          @click.stop="removeItem(item)"
          class="text-brand-600 hover:text-brand-800 dark:text-brand-400 dark:hover:text-brand-300"
        >
          &times;
        </button>
      </span>

      <!-- Input for search -->
      <input
        ref="inputRef"
        v-model="searchQuery"
        type="text"
        :placeholder="modelValue.length === 0 ? placeholder : ''"
        class="flex-1 bg-transparent border-none outline-none p-0 text-sm focus:ring-0 min-w-[60px]"
        @focus="openDropdown"
        @keydown.delete="handleDelete"
      />
      
      <!-- Caret icon -->
      <svg
        class="w-4 h-4 text-gray-400 ml-auto cursor-pointer"
        @click.stop="toggleDropdown"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Dropdown menu -->
    <div
      v-if="isOpen"
      class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg"
    >
      <div v-if="filteredOptions.length === 0" class="px-4 py-2 text-sm text-gray-500 text-center">
        No se encontraron resultados
      </div>
      <div
        v-for="option in filteredOptions"
        :key="option"
        @click="toggleItem(option)"
        class="flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
      >
        <input
          type="checkbox"
          :checked="modelValue.includes(option)"
          class="mr-3 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          @click.stop="toggleItem(option)"
        />
        <span class="text-gray-700 dark:text-gray-300">{{ option }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Seleccionar...',
  },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const searchQuery = ref('');
const inputRef = ref(null);
const containerRef = ref(null);

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;
  const q = searchQuery.value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '');
  return props.options.filter(opt => {
    const text = opt.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, '');
    return text.includes(q);
  });
});

const openDropdown = () => {
  isOpen.value = true;
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    inputRef.value?.focus();
  }
};

const closeDropdown = () => {
  isOpen.value = false;
  searchQuery.value = '';
};

const toggleItem = (item) => {
  const newValue = [...props.modelValue];
  const index = newValue.indexOf(item);
  if (index === -1) {
    newValue.push(item);
  } else {
    newValue.splice(index, 1);
  }
  emit('update:modelValue', newValue);
  inputRef.value?.focus();
};

const removeItem = (item) => {
  const newValue = props.modelValue.filter(i => i !== item);
  emit('update:modelValue', newValue);
};

const handleDelete = () => {
  if (searchQuery.value === '' && props.modelValue.length > 0) {
    const newValue = [...props.modelValue];
    newValue.pop();
    emit('update:modelValue', newValue);
  }
};

const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>
