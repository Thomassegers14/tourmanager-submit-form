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
  <Analytics />
  <SpeedInsights />
</template>

<script setup>
// import { Eclipse } from 'lucide-vue-next'
import Navbar from './components/navbar.vue';
import Countdown from './components/Countdown.vue';
import AppFooter from './components/Footer.vue'
import { EVENT_DEADLINE } from './config/event.js'
import { Analytics } from '@vercel/analytics/vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'

const deadline = EVENT_DEADLINE
</script>