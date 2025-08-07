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

const checkPassword = async () => {
  try {
    const res = await fetch('https://tourmanager-submit-form.onrender.com/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value })
    })

    if (res.ok) {
      localStorage.setItem('isAdmin', 'true')
      router.push('/admin')
    } else {
      error.value = true
    }
  } catch (err) {
    console.error('Login error:', err)
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
