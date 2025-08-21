<template>
  <!-- <button id="toggle-darkmode" class="button-darkmode">
    <Eclipse class="icon" />
    <span>darkmode</span>
  </button> -->
  <Navbar />
  <router-view />
</template>

<script setup>
import { Eclipse } from 'lucide-vue-next'
import Navbar from './components/navbar.vue';
</script>