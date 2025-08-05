<template>
  <button id="toggle-darkmode" class="button-darkmode"><Eclipse class="icon" /><span>darkmode</span></button>
  <main>
    <DeelnemerForm />
  </main>
</template>

<script setup>
import { Eclipse } from 'lucide-vue-next';
import DeelnemerForm from './components/DeelnemerForm.vue'
</script>