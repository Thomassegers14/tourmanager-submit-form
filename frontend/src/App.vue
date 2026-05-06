<template>
  <!-- <button id="toggle-darkmode" class="button-darkmode">
    <Eclipse class="icon" />
    <span>darkmode</span>
  </button> -->
  <Navbar />
  <Countdown
      :deadline="deadline"
    ></Countdown>
  <router-view />
  <AppFooter />
</template>

<script setup>
// import { Eclipse } from 'lucide-vue-next'
import Navbar from './components/navbar.vue';
import Countdown from './components/Countdown.vue';
import AppFooter from './components/Footer.vue'
import { EVENT_DEADLINE } from './config/event.js'

const deadline = EVENT_DEADLINE
</script>