<template>
  <div class="form-container">
    <h2>Inzending Formulier</h2>

    <form @submit.prevent="submitForm">
      <input v-model="form.voornaam" placeholder="Voornaam" required />
      <input v-model="form.achternaam" placeholder="Achternaam" required />
      <input v-model="form.email" type="email" placeholder="Email" required />

      <label> Selecteer exact 10 renners: </label>

      <div v-for="(renners, team) in groupedRenners" :key="team" class="team-block">
        <h4>{{ team }}</h4>
        <div
          v-for="renner in renners"
          :key="renner.rider_id"
          class="checkbox-item"
        >
          <input
            type="checkbox"
            :id="'r-' + renner.rider_id"
            :value="renner.rider_id"
            v-model="form.selectie"
            :disabled="form.selectie.length >= 10 && !form.selectie.includes(renner.rider_id)"
          />
          <label :for="'r-' + renner.rider_id">{{ renner.rider_name }}</label>
        </div>
      </div>

            <p v-if="form.selectie.length !== 10" class="warning">
        Je moet exact 10 renners selecteren.
      </p>

      <button type="submit">Verzend</button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import renners from '../data/startlist-tour-de-france-2025.json' // of .js/.ts array

const form = ref({
  voornaam: '',
  achternaam: '',
  email: '',
  selectie: []
})

// 🔁 groepeer renners per team_name
const groupedRenners = computed(() => {
  const grouped = {}
  for (const renner of renners) {
    if (!grouped[renner.team_name]) {
      grouped[renner.team_name] = []
    }
    grouped[renner.team_name].push(renner)
  }
  return grouped
})

const submitForm = async () => {
  if (form.value.selectie.length !== 10) {
    alert('Gelieve exact 10 renners te selecteren.')
    return
  }

  try {
    const res = await fetch('https://tourmanager-submit-form.onrender.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })

    if (!res.ok) throw new Error('Fout bij verzenden')

    alert('Inzending verstuurd!')
    form.value = {
      voornaam: '',
      achternaam: '',
      email: '',
      selectie: []
    }
  } catch (err) {
    console.error(err)
    alert('Er is iets misgelopen bij het verzenden.')
  }
}
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: auto;
  padding: 1rem;
}
input,
button {
  display: block;
}

button {
  width: 100%;
  margin-bottom: 1rem;
}

.team-block {
  margin-bottom: 1.5rem;
  border: 1px solid #ccc;
  padding-bottom: 0.5rem;
}
.checkbox-item {
  display: flex;
  align-items: center;
}

.checkbox {
  background-color: red;
}

.warning {
  color: red;
  font-size: 0.9rem;
}
</style>