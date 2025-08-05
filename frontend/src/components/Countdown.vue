<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  deadline: Date
})

const timeLeft = ref(getTimeRemaining())

let interval

function getTimeRemaining() {
  const total = props.deadline - new Date()
  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))
  return { total, days, hours, minutes, seconds }
}

onMounted(() => {
  interval = setInterval(() => {
    timeLeft.value = getTimeRemaining()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <span v-if="timeLeft.total > 0" class="badge badge-outline">
    {{ timeLeft.days }}d {{ timeLeft.hours }}u {{ timeLeft.minutes }}m {{ timeLeft.seconds }}s
  </span>
  <div v-else>
    Deadline voorbij!
  </div>
</template>
