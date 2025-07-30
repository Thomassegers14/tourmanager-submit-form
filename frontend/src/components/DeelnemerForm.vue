<template>
  <div class="form-container">
    <h2 class="form-title">Inzending Formulier</h2>

    <form @submit.prevent="submitForm">
      <input v-model="form.voornaam" placeholder="Voornaam" required />
      <input v-model="form.achternaam" placeholder="Achternaam" required />
      <input v-model="form.email" type="email" placeholder="Email" required />

      <!-- Sticky Header -->
      <div class="form-header">
        <h3 class="form-subtitle">Stel je ploeg samen</h3 class="form-subtitle">
        <div class="selected-riders" v-if="selectedRiders.length > 0">
          <div class="points-summary">
            <label>Favorieten punten</label>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
            </div>
          </div>
          <ul>
            <li v-for="r in selectedRiders" :key="r.rider_id">{{ r.rider_name }}</li>
          </ul>
        </div>
        <div class="status-row">
          <p><strong>{{ form.selectie.length }}</strong> / {{ maxRenners }} renners geselecteerd</p>
          <p><strong>{{ totalPoints }}</strong> / {{ maxPoints }} punten gebruikt – Nog {{ maxPoints - totalPoints }} beschikbaar</p>
          <button :disabled="!formValid">Verzend selectie</button>
        </div>
        <p v-if="form.voornaam.trim() === '' || form.achternaam.trim() === '' || form.email.trim() === ''"
          class="warning">
          Vul alle velden in: voornaam, achternaam en e-mail zijn verplicht.
        </p>
        <p v-if="form.selectie.length !== maxRenners" class="warning">
          Je moet exact {{ maxRenners }} renners selecteren.
        </p>
      </div>

      <!-- Grid van teams en renners -->
      <div class="teams-grid">
        <div v-for="(renners, team) in groupedRenners" :key="team" class="team-column">
          <h3 class="team-name">{{ team }}</h3>
          <div class="rider-grid">
            <label v-for="renner in renners" :key="renner.rider_id" class="rider-card" :class="{
              selected: form.selectie.includes(renner.rider_id),
              disabled: checkboxDisabled(renner)
            }">
              <input type="checkbox" :id="'r-' + renner.rider_id" :value="renner.rider_id" v-model="form.selectie"
                :disabled="checkboxDisabled(renner)" />
              <div class="rider-info">
                <p class="rider-name">{{ renner.rider_name }}</p>
                <p class="rider-points">{{ renner.fav_points }} pts</p>
              </div>
            </label>

          </div>
        </div>
      </div>
    </form>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import renners from '../data/startlist-tour-de-france-2025.json'

const maxPoints = 10
const maxRenners = 12

const form = ref({
  voornaam: '',
  achternaam: '',
  email: '',
  selectie: []
})

const selectedRiders = computed(() =>
  renners.filter(r => form.value.selectie.includes(r.rider_id))
)

const totalPoints = computed(() =>
  selectedRiders.value.reduce((sum, r) => sum + Number(r.fav_points), 0)
)

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

const progressPercentage = computed(() => Math.min((totalPoints.value / maxPoints) * 100, 100))

const formValid = computed(() =>
  form.value.voornaam.trim() !== '' &&
  form.value.achternaam.trim() !== '' &&
  form.value.email.trim() !== '' &&
  form.value.selectie.length === maxRenners &&
  totalPoints.value <= maxPoints
)

const checkboxDisabled = (renner) => {
  const alreadySelected = form.value.selectie.includes(renner.rider_id)
  const wouldExceedPoints = totalPoints.value + Number(renner.fav_points) > maxPoints
  const tooMany = form.value.selectie.length >= maxRenners

  return (!alreadySelected && (wouldExceedPoints || tooMany))
}

const submitForm = async () => {
  if (form.value.selectie.length !== maxRenners) {
    alert(`Gelieve exact ${maxRenners} renners te selecteren.`)
    return
  }
  if (totalPoints.value > maxPoints) {
    alert(`Je mag maximaal ${maxPoints} fav_points gebruiken.`)
    return
  }

  // 👉 Bouw aparte arrays
  const selected = renners.filter(r =>
    form.value.selectie.includes(r.rider_id)
  )

  const payload = {
    voornaam: form.value.voornaam,
    achternaam: form.value.achternaam,
    email: form.value.email,
    selectie: selectedRiders.value.map(r => ({
      rider_id: r.rider_id,
      rider_name: r.rider_name
    }))
  }

  try {
    const res = await fetch('https://tourmanager-submit-form.onrender.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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
  max-width: 1280px;
  width: 100%;
  margin: auto;
  padding: 1rem;
  box-sizing: border-box;
}

.form-header {
  position: sticky;
  top: 0;
  background-color: white;
  padding: 1rem;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #ddd;
  color: var(--grey);
}

.form-title {
  color: var(--dark);
}

.form-subtitle {
  color: var(--dark);
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.selected-riders ul {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-riders li {
  background-color: #eee;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--dark);
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.team-column {
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 0.8rem;
  background: #f9f9f9;
}

.team-name {
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--dark)
}

.rider-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.rider-card {
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white;
  transition: background-color 0.2s, border-color 0.2s;
  padding: 9px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.rider-card.selected {
  background-color: var(--accentColorLight);
  border-color: var(--accentColor);
}

.rider-card.disabled {
  opacity: 0.4;
  pointer-events: none;
  /* voorkomt hover of klikken */
  cursor: not-allowed;
}

.rider-card input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin: 0;
}

.rider-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
}

.rider-name {
  font-weight: 500;
  font-size: 0.8rem;
  color: var(--dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.rider-points {
  font-size: 0.85rem;
  color: var(--grey);
  white-space: nowrap;
  margin: 0;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.points-summary {
  margin: 1rem 0;
}

.progress-bar {
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
  height: 10px;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 10px;
  background-color: var(--accentColor);
  transition: width 0.3s ease;
}

.warning {
  text-align: center;
  color: var(--warning);
}
</style>