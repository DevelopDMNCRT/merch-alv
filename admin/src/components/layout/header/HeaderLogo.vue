<template>
  <router-link to="/" class="lg:hidden">
    <img class="dark:hidden" src="/logo-light-01.png" alt="Logo" width="150" />
    <img class="hidden dark:block" src="/logo-dark-01.png" alt="Logo" width="150" />
  </router-link>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
