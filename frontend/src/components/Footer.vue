<template>
  <footer class="app-footer">
<p>
  © {{ new Date().getFullYear() }} – Gemaakt door
  <a href="https://github.com/Thomassegers14" target="_blank">Thomas Segers</a>
</p>
  </footer>
</template>

<script setup>
// niets speciaals nodig hier
</script>

<style scoped>
.app-footer {
    padding-top: 1rem;
    text-align: center;
    border-top: 1px solid var(--border);
}

.app-footer p {
    font-size: var(--text-xs);
}

.app-footer a {
    text-decoration: underline;
    color: var(--primary);
}
</style>
