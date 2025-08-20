<template>
  <button id="toggle-darkmode" class="button-darkmode">
    <Eclipse class="icon" />
    <span>darkmode</span>
  </button>
  <NavBar />
  <router-view />
</template>

<script setup>
import { Eclipse } from 'lucide-vue-next'
import NavBar from './components/NavBar.vue';
</script>