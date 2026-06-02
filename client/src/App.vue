<script setup>
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import Preloader from './components/Preloader.vue'
</script>

<template>
  <Preloader />
  <SiteHeader />
  <router-view :key="$route.fullPath" />
  <SiteFooter />
</template>

<style>
/* App.vue specific styles can go here */
</style>
