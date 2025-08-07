<!-- views/AdminLogin.vue -->
<template>
  <div class="login">
    <h2>Admin Login</h2>
    <form @submit.prevent="checkPassword">
      <input v-model="password" type="password" placeholder="Wachtwoord" />
      <button type="submit">Login</button>
      <p v-if="error" class="error">Ongeldig wachtwoord</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const password = ref('')
const error = ref(false)
const emit = defineEmits(['login-success'])

const checkPassword = async () => {
  try {
    const res = await fetch('https://tourmanager-submit-form.onrender.com/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value })
    })

    if (res.ok) {
      localStorage.setItem('isAdmin', 'true')
      emit('login-success')
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
  max-width: 600px;
  margin: 4rem auto;
  text-align: center;
}

form {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
}
.error {
  color: red;
  margin-top: 0.5rem;
}
</style>
