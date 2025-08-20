<template>
  <button id="toggle-darkmode" class="button-darkmode">
    <Eclipse class="icon" />
    <span>darkmode</span>
  </button>
  <navbar />
  <router-view />
</template>

<script setup>
import { Eclipse } from 'lucide-vue-next'
import navbar from './components/NavBar.vue';
</script>