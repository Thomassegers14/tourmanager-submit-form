<template>
  <div class="not-found">
    <h1>404 - Pagina niet gevonden</h1>
    <p>Sorry, de pagina die je zoekt bestaat niet.</p>
    <router-link to="/">Ga terug naar de startpagina</router-link>
  </div>
</template>

<script setup>
// geen script nodig voor deze simpele pagina
</script>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 4rem;
}
</style>
