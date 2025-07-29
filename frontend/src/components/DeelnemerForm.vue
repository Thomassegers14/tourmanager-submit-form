<template>
  <div>
    <h1>Deelnemerselectie</h1>

    <form @submit.prevent="handleSubmit">
      <label>
        Voornaam:
        <input type="text" v-model="form.voornaam" required />
      </label>
      <label>
        Achternaam:
        <input type="text" v-model="form.achternaam" required />
      </label>
      <label>
        E-mailadres:
        <input type="email" v-model="form.email" required />
      </label>

      <fieldset>
        <legend>Selecteer maximaal 10 deelnemers:</legend>
        <div v-for="r in deelnemers" :key="r.rider_id">
          <label>
            <input
              type="checkbox"
              :value="r.rider_name"
              v-model="form.selectie"
              :disabled="form.selectie.length >= 10 && !form.selectie.includes(r.rider_name)"
            />
            {{ r.rider_name }}
          </label>
        </div>
      </fieldset>

      <p class="error" v-if="error">{{ error }}</p>
      <button type="submit">Verstuur selectie</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Papa from 'papaparse'

const deelnemers = ref([])
const form = ref({
  voornaam: '',
  achternaam: '',
  email: '',
  selectie: []
})
const error = ref('')

onMounted(async () => {
  const res = await fetch('/deelnemers.csv')
  const text = await res.text()
  const result = Papa.parse(text, { header: true })
  deelnemers.value = result.data.filter(r => r.rider_name)
})

const handleSubmit = async () => {
  if (form.value.selectie.length === 0) {
    error.value = 'Selecteer minstens 1 deelnemer.'
    return
  }
  error.value = ''

  // Optioneel: versturen naar backend
  const response = await fetch('https://tourmanager-submit-form.onrender.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form.value)
  })

  if (response.ok) {
    alert('Inzending verstuurd!')
    form.value = { voornaam: '', achternaam: '', email: '', selectie: [] }
  } else {
    alert('Er ging iets mis bij het verzenden.')
  }
}
</script>

<style scoped>
label {
  display: block;
  margin: 10px 0;
}
input[type='text'],
input[type='email'] {
  width: 100%;
  padding: 8px;
}
fieldset {
  margin-top: 20px;
}
.error {
  color: red;
  margin-top: 10px;
}
button {
  margin-top: 15px;
  padding: 10px 15px;
}
</style>
