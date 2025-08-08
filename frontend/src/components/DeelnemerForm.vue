<template>
  <form @submit.prevent="submitForm">

    <section>
      <h2 class="section-title">Persoonlijke gegevens</h2>
      <div class="input-container">
        <input v-model="form.voornaam" placeholder="Voornaam" required />
        <input v-model="form.achternaam" placeholder="Achternaam" required />
        <input v-model="form.email" type="email" placeholder="Email" required />
      </div>
      <p class="warning"><span
          v-if="form.voornaam.trim() === '' || form.achternaam.trim() === '' || form.email.trim() === ''">
          Vul alle velden in: voornaam, achternaam en e-mail zijn verplicht.
        </span>
      </p>
    </section>

    <section>
      <h2 class="section-title">Stel je ploeg samen</h2>
      <div class="form-header">
        <div class="status-row">
          <div class="status-count">
            <Users class="icon" />
            <p>Geselecteerd:</p>
            <span class="badge badge-secondary">
              {{ form.selectie.length }} renners
            </span>
          </div>
          <div class="selected-riders" v-if="selectedRiders.length > 0">
            <ul>
              <span class="badge badge-secondary"
                v-for="r in (showAllSelected ? selectedRiders : selectedRiders.slice(0, showSelectedRiders))"
                :key="r.rider_id">
                {{ extractUppercase(r.rider_name) }}
              </span>

              <button v-if="selectedRiders.length > showSelectedRiders" type="button" class="button button-s"
                @click="showAllSelected = !showAllSelected">
                {{ showAllSelected ? 'Toon minder' : '+' + (selectedRiders.length - showSelectedRiders) + ' meer' }}
              </button>
            </ul>
          </div>
          <button :disabled="!formValid">
            <Send class="icon icon--white" /> Verzenden
          </button>
        </div>
        <p class="warning">
          <span v-if="form.selectie.length !== maxRenners">
            Je moet exact {{ maxRenners }} renners selecteren.
          </span>
        </p>
        <div class="points-summary">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
            <label>Punten gebruikt</label>
            <label><strong>{{ totalPoints }}</strong> / {{ maxPoints }} punten</label>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Grid van teams en renners -->
      <div class="teams-grid">
        <div v-for="(renners, team) in groupedRenners" :key="team" class="team-column">
          <h6 class="team-name">
            {{ team.replace(/\s*\([^)]*\)/g, "").trim() }}
          </h6>
          <p class="team-stats">
            <Users class="icon icon-s" />{{ getTeamStats(team).totalRiders }} renners –
            {{ getTeamStats(team).selectedPoints }}/{{ getTeamStats(team).totalPoints }} pt
          </p>
          <div class="rider-grid">
            <label v-for="renner in renners" :key="renner.rider_id" class="rider-card" :class="{
              selected: form.selectie.includes(renner.rider_id),
              disabled: checkboxDisabled(renner)
            }">
              <input type="checkbox" :id="'r-' + renner.rider_id" :value="renner.rider_id" v-model="form.selectie"
                :disabled="checkboxDisabled(renner)" class="hidden-checkbox" />
              <div class="rider-info">
                <p class="rider-name">{{ formatRiderName(renner.rider_name) }}</p>
                <span v-if="Number(renner.fav_points) > 0" class="badge badge-outline">
                  {{ renner.fav_points }}pt
                </span>
              </div>
              <span class="checkbox-wrapper">
                <svg v-if="form.selectie.includes(renner.rider_id)" class="icon-check" viewBox="0 0 24 24">
                  <path d="M5 13l4 4L19 7" />
                </svg>
                <span v-else class="icon-plus">+</span>
              </span>
            </label>

          </div>
        </div>
      </div>
    </section>

  </form>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { Users, Send, Eclipse } from 'lucide-vue-next'
import renners from '../data/startlist-tour-de-france-2025.json'

const props = defineProps({
  maxPoints: Number,
  maxRenners: Number
})

const { maxPoints, maxRenners } = props

const showSelectedRiders = ref(5)
const showAllSelected = ref(false)

const handleResize = () => {
  showSelectedRiders.value = window.innerWidth < 768 ? 3 : 5
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})


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

const getTeamStats = (teamName) => {
  const teamRiders = groupedRenners.value[teamName] || []

  const selected = teamRiders.filter(r =>
    form.value.selectie.includes(r.rider_id)
  )

  const totalPoints = teamRiders.reduce((sum, r) => sum + Number(r.fav_points), 0)
  const selectedPoints = selected.reduce((sum, r) => sum + Number(r.fav_points), 0)

  return {
    totalRiders: teamRiders.length,
    selectedPoints,
    totalPoints,
  }
}

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
  // Match alle uppercase woorden tot het eerste woord met een kleine letter (Unicode aware)
  const match = name.match(/^([\p{Lu}\- ]+)(?= \p{Lu}?[a-z])/u)
  return match ? match[1].trim() : name
}

function formatRiderName(fullName) {
  const parts = fullName.trim().split(' ')
  if (parts.length < 2) return fullName

  const firstName = parts.pop()
  const lastName = parts.join(' ').toLowerCase()

  // Capitalize eerste letter na spaties en speciale tekens
  const capitalizedLastName = lastName.replace(/(^|\s|-)(\p{L})/gu, (_, sep, letter) =>
    sep + letter.toLocaleUpperCase()
  )

  return `${firstName} ${capitalizedLastName}`
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
.form-header {
  position: sticky;
  top: 49px;
  background-color: var(--background);
  padding: 1rem 0;
  z-index: 10;
  border-bottom: 1px solid var(--border);
  box-shadow: 0 1rem 0.5rem -0.5rem rgba(0, 0, 0, 0.05);
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
  display: none;
  align-items: center;
  gap: 6px;
}

@media (min-width: 768px) {
  .status-count {
    display: flex;
  }
}

.selected-riders {
  flex-grow: 1;
  min-width: 0;
  overflow: hidden;
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

.status-row>button,
.status-row>.status-count {
  flex-shrink: 0;
  /* knop krimpt niet */
  white-space: nowrap;
  /* knop tekst blijft op één lijn */
}

@media (max-width: 768px) {
  .status-row {
    flex-direction: column;
    align-items: flex-start;
    /* items links uitlijnen */
    gap: 0.5rem;
  }

  .selected-riders ul {
    justify-content: flex-start;
  }

  .status-row>button {
    align-self: center;
    /* links onder */
    flex-shrink: 0;
    white-space: nowrap;
    /* tekst niet breken */
    width: auto;
    /* geen volle breedte */
    display: inline-flex;
    /* alleen zo breed als nodig */
  }
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin: 6rem 0;
}

.team-name {
  font-weight: var(--font-weight-medium);
  font-size: var(--text-xs);
  color: var(--primary);
  text-transform: uppercase;
  margin: 0;
  border-top: 1px solid var(--primary);
  padding-top: 0.5rem;
}

.team-stats {
  font-weight: normal;
  font-size: var(--text-sm);
  color: var(--muted-foreground);
  margin: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 3px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.rider-grid {
  display: grid;
  grid-template-columns: 1fr;
}

.rider-card {
  border-bottom: 1px solid var(--border);
  background-color: transparent;
  transition: background-color 0.2s, border-color 0.2s;
  padding: 3px 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}

.rider-card.selected {
  background-color: var(--secondary);
}

.rider-card.disabled {
  opacity: 0.2;
  pointer-events: none;
  cursor: not-allowed;
}

.hidden-checkbox {
  display: none;
}

.checkbox-wrapper {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  transition: background-color 0.3s, transform 0.3s;
}

.icon-plus {
  font-size: var(--text-2xl);
  color: var(--muted-foreground);
  transition: opacity 0.2s ease;
}

.icon-check {
  stroke: var(--primary);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  animation: bounceIn 0.3s ease;
}

/* animatie voor SVG vinkje */
@keyframes bounceIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }

  60% {
    transform: scale(1.3);
    opacity: 1;
  }

  100% {
    transform: scale(1);
  }
}

.rider-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
}

.rider-name {
  margin: 0 0 0.5rem;
  font-weight: var(--font-weight-medium);
  font-size: var(--text-sm);
}

.rider-points {
  white-space: nowrap;
  margin: 0;
}

.points-summary {
  margin: 0;
}

.progress-bar {
  background-color: var(--secondary);
  border-radius: 3px;
  overflow: hidden;
  height: 6px;
  margin-bottom: 0;
}

.progress-fill {
  height: 10px;
  background-color: var(--accent);
  transition: width 0.3s ease;
}


@media (min-width: 768px) {
  .points-summary {
    margin: 1rem 0;
  }

  .progress-bar {
      height: 10px;
      margin-bottom: 0.5rem;
  }
}

</style>