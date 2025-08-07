<template>
  <nav class="navbar">
    <router-link to="/" class="nav-link">Selectie</router-link>

    <router-link to="/admin" class="nav-link">
      Admin
    </router-link>

    <button v-if="isAdmin" class="button button-s" @click="logout">Logout</button>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const isAdmin = ref(false)
const router = useRouter()

const checkAdmin = () => {
  isAdmin.value = localStorage.getItem('isAdmin') === 'true'
}

// Initial check
onMounted(() => {
  checkAdmin()
})

// Re-check if admin status changes
window.addEventListener('storage', checkAdmin)

const logout = () => {
  localStorage.removeItem('isAdmin')
  isAdmin.value = false
  router.push('/')
}
</script>

<style scoped>
nav {
  height: 48px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  background: var(--background);
  color: var(--primary);
  border-bottom: 1px solid var(--border);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 11;
}

nav a {
  color: var(--primary);
  line-height: 48px;
}

a.router-link-exact-active {
  font-weight: var(--font-weight-bold);
  border-bottom: 2px solid var(--primary);
}
</style>