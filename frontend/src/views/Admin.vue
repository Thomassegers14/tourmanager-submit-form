<template>
  <div>
    <AdminLogin v-if="!isAdmin" @login-success="onLoginSuccess" />
    <AdminDashboard v-else />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminLogin from '../components/AdminLogin.vue'
import AdminDashboard from '../components/AdminDashboard.vue'

const isAdmin = ref(false)

const onLoginSuccess = () => {
  isAdmin.value = true
  localStorage.setItem('isAdmin', 'true')
}

onMounted(() => {
  isAdmin.value = localStorage.getItem('isAdmin') === 'true'
})
</script>