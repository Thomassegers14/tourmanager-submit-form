<template>
  <div class="page-header">
    <Countdown
      :deadline="deadline"
    ></Countdown>
    <h1>
      {{ title }}
      <span class="grey">{{ subtitle }}</span>
    </h1>
    <p class="intro">
      Maak je perfecte wielrenner selectie van {{ maxRenners }} renners binnen de puntenlimiet van {{ maxPoints }} punten.
      Kies strategisch uit de beste renners van verschillende teams.
    </p>
  </div>
</template>

<script setup>
import Countdown from './Countdown.vue';

defineProps({
  title: String,
  subtitle: String,
  maxPoints: Number,
  maxRenners: Number,
  deadline: Date
})
</script>

<style>
.grey {
  display: block;
  color: var(--muted-foreground);
}
</style>
