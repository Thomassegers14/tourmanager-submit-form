<template>
  <h1>
    Wielrenner Selectie
    <span class="grey">{{ eventName.replaceAll('-',' ') }}</span>
  </h1>
  <p class="intro">
    Maak je perfecte wielrenner selectie van {{ maxRenners }} renners binnen de puntenlimiet van {{ maxPoints }} punten.
    Kies strategisch uit de beste renners van
    verschillende teams.
  </p>

  <form @submit.prevent="submitForm">

    <div class="form-section">
      <h2 class="form-section-title">Persoonlijke gegevens</h2>
      <div class="input-container">
        <input v-model="form.voornaam" placeholder="Voornaam" required />
        <input v-model="form.achternaam" placeholder="Achternaam" required />
        <input v-model="form.email" type="email" placeholder="Email" required />
      </div>
    </div>

    <div class="form-section">
      <h2 class="form-section-title">Stel je ploeg samen</h2>
      <div class="form-header">
        <div class="status-row">
          <div class="status-count">
            <Users class="icon" />
            <p>Geselecteerd:</p>
            <span class="badge badge--secondary">
              {{ form.selectie.length }} renners
            </span>
          </div>
          <div class="selected-riders" v-if="selectedRiders.length > 0">
            <ul>
              <li
                class="badge badge--secondary"
                v-for="r in (showAllSelected ? selectedRiders : selectedRiders.slice(0, showSelectedRiders))"
                :key="r.rider_id"
              >
                {{ extractUppercase(r.rider_name) }}
              </li>

              <li
                v-if="selectedRiders.length > showSelectedRiders"
                class="badge badge--primary toggle-badge"
                @click="showAllSelected = !showAllSelected"
              >
                {{ showAllSelected ? 'Toon minder' : '+' + (selectedRiders.length - showSelectedRiders) + ' meer' }}
              </li>
            </ul>
          </div>
          <button :disabled="!formValid">
            <Send class="icon icon--white" /> Verzenden
          </button>
        </div>
        <div class="points-summary">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <label>Punten gebruikt</label>
            <label><strong>{{ totalPoints }}</strong> / {{ maxPoints }} punten</label>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>
        <p class="warning"><span
            v-if="form.voornaam.trim() === '' || form.achternaam.trim() === '' || form.email.trim() === ''">
            Vul alle velden in: voornaam, achternaam en e-mail zijn verplicht.
          </span>
          <span v-if="form.selectie.length !== maxRenners">
            Je moet exact {{ maxRenners }} renners selecteren.
          </span>
        </p>
      </div>

      <!-- Grid van teams en renners -->
      <div class="teams-grid">
        <div v-for="(renners, team) in groupedRenners" :key="team" class="team-column">
          <h6 class="team-name">{{ team.replace(/\s*\([^)]*\)/g, "").trim() }}</h6>
          <div class="rider-grid">
            <label v-for="renner in renners" :key="renner.rider_id" class="rider-card" :class="{
              selected: form.selectie.includes(renner.rider_id),
              disabled: checkboxDisabled(renner)
            }">
              <input type="checkbox" :id="'r-' + renner.rider_id" :value="renner.rider_id" v-model="form.selectie"
                :disabled="checkboxDisabled(renner)" />
              <div class="rider-info">
                <p class="rider-name">{{ renner.rider_name }}</p>
                <badge class="badge badge--outline">{{ renner.fav_points }}pt</badge>
              </div>
            </label>

          </div>
        </div>
      </div>
    </div>

  </form>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Users, Send } from 'lucide-vue-next'
import renners from '../data/startlist-tour-de-france-2025.json'

const eventName = computed(() => {
  const first = renners[0]
  return first?.event_id || 'onbekend'
})


const maxPoints = 10
const maxRenners = 12

const showSelectedRiders = 5
const showAllSelected = ref(false)

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

const extractUppercase = (name) => {
  // Match alle woorden in hoofdletters tot het eerste woord met een kleine letter
  const match = name.match(/^([A-ZÀ-Ü\- ]+)(?= [A-ZÀ-ÿ][a-z])/)
  return match ? match[1].trim() : name
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
.grey {
  display: block;
  color: var(--muted-foreground);
}
.form-header {
  position: sticky;
  top: 0;
  background-color: var(--background);
  padding: 1rem;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section {
  border-top: 1px solid var(--border);
  margin: 6em 0;
}

.form-section-title {
  font-size: var(--text-lg);
}

.input-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 24px 0;
}

.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: nowrap;
}

.status-count {
  display: flex; 
  align-items: center; 
  gap: 6px;
}

.selected-riders {
  flex-grow: 1;     /* neemt alle beschikbare ruimte in */
  min-width: 0;     /* belangrijk voor overflow wrapping in flex */
  overflow: hidden; /* voorkom overflow buiten container */
}

.selected-riders ul {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 9px;
  margin: 0;
  list-style: none;
  border: 1px solid var(--border);
  border-radius: 12px;
  max-width: 100%;
}

.status-row > button,
.status-row > .status-count {
  flex-shrink: 0;   /* knop krimpt niet */
  white-space: nowrap; /* knop tekst blijft op één lijn */
}

@media (max-width: 768px) {
  .status-row {
    flex-direction: column;
    align-items: flex-start; /* items links uitlijnen */
    gap: 0.5rem;
  }

  .selected-riders ul {
      justify-content: flex-start;
  }

  .status-row > button {
    align-self: flex-start; /* links onder */
    flex-shrink: 0;
    white-space: nowrap; /* tekst niet breken */
    width: auto; /* geen volle breedte */
    display: inline-flex; /* alleen zo breed als nodig */
  }
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.team-column {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.8rem;
  background: #f9f9f9;
}

.team-name {
  font-weight: var(--font-weight-light);
  color: var(--primary);
  margin: 0.8rem 0;
}

.rider-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.rider-card {
  border: 1px solid var(--border);
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
  background-color: var(--secondary);
  border-color: var(--primary);
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
  font-weight: var(--font-weight-medium);
}

.rider-points {
  white-space: nowrap;
  margin: 0;
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
  background-color: var(--accent);
  transition: width 0.3s ease;
}

.icon {
  width: 18px;
  color: var(--muted-foreground)
}

.icon--white {
  color: white;
}

.toggle-badge {
  cursor: pointer;
  transition: background-color 0.2s;
}

.toggle-badge:hover {
  background-color: #e0e0e0;
}
</style>