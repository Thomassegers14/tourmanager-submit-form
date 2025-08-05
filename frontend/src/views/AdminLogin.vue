<!-- views/AdminLogin.vue -->
<template>
  <div class="login">
    <h2>Admin Login</h2>
    <form @submit.prevent="checkPassword">
      <input v-model="password" type="password" placeholder="Voer admin wachtwoord in" />
      <button type="submit">Login</button>
      <p v-if="error" class="error">Ongeldig wachtwoord</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const password = ref('')
const error = ref(false)
const router = useRouter()

const checkPassword = () => {
  const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD

  if (password.value === correctPassword) {
    localStorage.setItem('isAdmin', 'true')
    router.push('/admin')
  } else {
    error.value = true
  }
}
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 4rem auto;
  text-align: center;
}

form {
    display: flex;
    gap: 1rem;
}
.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
