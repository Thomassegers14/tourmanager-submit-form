<template>
  <section>
    <h2>Admin Dashboard</h2>

    <!-- Filters -->
    <div class="filters">
      <input v-model="filters.voornaam" placeholder="Filter op voornaam" />
      <input v-model="filters.achternaam" placeholder="Filter op achternaam" />
      <input v-model="filters.email" placeholder="Filter op email" />
      <input v-model="filters.renner" placeholder="Zoek op rennersnaam" />
      <select v-model="filters.ploeg" class="select-outline">
        <option value="">Alle ploegen</option>
        <option v-for="team in allTeams" :key="team" :value="team">{{ team }}</option>
      </select>
    </div>

    <!-- Grid -->
    <div class="inzendingen-grid">
      <div class="inzending-card" v-for="inzending in filteredInzendingen" :key="inzending.id"
        :class="{ duplicate: isDuplicate(inzending.email, inzending.voornaam, inzending.achternaam) }"
        @click="toggleDetails(inzending.id)">
        <div class="card-time">
          <p class="tijdstip">{{ formatDate(inzending.tijdstip) }}</p>
          <p class="tijdstip">{{ formatTime(inzending.tijdstip) }}</p>
        </div>
        <div class="card-header">
          <p>{{ inzending.voornaam }} {{ inzending.achternaam }}</p>
          <p>{{ inzending.email }}</p>
        </div>

        <span class="badge badge-primary">
          {{ inzending.rider_names_parsed.length }} renners
          <span v-if="expandedId === inzending.id">-</span>
          <span v-else>+</span>
        </span>

        <!-- Tooltip -->
        <div v-if="expandedId === inzending.id" class="tooltip-overlay" @click.stop>
          <div class="renner-list">
            <span v-for="(renner, index) in inzending.rider_names_parsed" :key="index" class="badge badge-secondary">
              {{ renner }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStartlist } from '../data/getStartlist.js'
import { EVENT_ID, EVENT_YEAR } from '../config/event.js'

const inzendingen = ref([])
const expandedId = ref(null)
const filters = ref({
  voornaam: '',
  achternaam: '',
  email: '',
  renner: '',
  ploeg: '',
})

const { startlist, fetchStartlist } = useStartlist()

const riderTeamMap = computed(() => {
  const map = new Map()
  startlist.value.forEach(r => map.set(String(r.rider_id), r.team_name))
  return map
})

const allTeams = computed(() => {
  const teams = new Set(startlist.value.map(r => r.team_name).filter(Boolean))
  return [...teams].sort()
})

const parsePostgresArray = (str) => {
  if (!str) return []
  if (Array.isArray(str)) return str
  let trimmed = str.trim()
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    trimmed = trimmed.slice(1, -1)
  }
  return trimmed.split('","').map(s => s.replace(/^"|"$/g, ''))
}

const toggleDetails = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
}

const filteredInzendingen = computed(() => {
  return inzendingen.value.filter((item) => {
    const vMatch = item.voornaam.toLowerCase().includes(filters.value.voornaam.toLowerCase())
    const aMatch = item.achternaam.toLowerCase().includes(filters.value.achternaam.toLowerCase())
    const eMatch = item.email.toLowerCase().includes(filters.value.email.toLowerCase())

    const rennerZoek = filters.value.renner.toLowerCase()
    const rMatch = !rennerZoek || item.rider_names_parsed.some(
      n => n.toLowerCase().includes(rennerZoek)
    )

    const ploegFilter = filters.value.ploeg
    const pMatch = !ploegFilter || (item.rider_ids_parsed ?? parsePostgresArray(item.rider_ids)).some(
      id => riderTeamMap.value.get(String(id)) === ploegFilter
    )

    return vMatch && aMatch && eMatch && rMatch && pMatch
  })
})

// helper om een consistente sleutel te maken
const makeDupKey = ({ email = '', voornaam = '', achternaam = '' }) =>
  `${String(email).trim().toLowerCase()}|${String(voornaam).trim().toLowerCase()}|${String(achternaam).trim().toLowerCase()}`

// Set met alle combinaties die vaker dan 1x voorkomen
const duplicateKeySet = computed(() => {
  const counts = new Map()
  for (const item of inzendingen.value) {
    const key = makeDupKey(item)
    counts.set(key, (counts.get(key) || 0) + 1)
  }
  const result = new Set()
  counts.forEach((count, key) => {
    if (count > 1) result.add(key)
  })
  return result
})

// gebruik de Set om snel te checken
const isDuplicate = (email, voornaam, achternaam) => {
  const key = makeDupKey({ email, voornaam, achternaam })
  return duplicateKeySet.value.has(key)
}

const formatDate = (datumStr) => {
  const date = new Date(datumStr)
  return new Intl.DateTimeFormat('nl-BE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

const formatTime = (datumStr) => {
  const date = new Date(datumStr)
  return new Intl.DateTimeFormat('nl-BE', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

onMounted(async () => {
  fetchStartlist(EVENT_ID, EVENT_YEAR)
  try {
    const res = await fetch('/api/inzendingen')
    const data = await res.json()
    data.forEach(item => {
      item.rider_names_parsed = parsePostgresArray(item.rider_names)
      item.rider_ids_parsed = parsePostgresArray(item.rider_ids)
    })
    inzendingen.value = data
  } catch (err) {
    console.error('Fout bij ophalen inzendingen:', err)
  }
})

onMounted(() => {
  const handleClickOutside = (event) => {
    const cards = document.querySelectorAll('.inzending-card')
    let clickedInside = false
    cards.forEach(card => {
      if (card.contains(event.target)) clickedInside = true
    })
    if (!clickedInside) expandedId.value = null
  }

  document.addEventListener('click', handleClickOutside)
})

</script>

<style scoped>
.filters {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.inzendingen-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.5rem;
}

.inzending-card {
  position: relative;
  border: 1px solid var(--border);
  border-top: 3px solid var(--primary);
  padding: 1rem 0.5rem;
  cursor: pointer;
}

.inzending-card.duplicate {
  border-top: 3px solid var(--destructive);
}

.inzending-card p {
  font-size: var(--text-xs);
  margin: 0;
}

.card-header {
  margin: 0.5rem 0;
}

.card-time {
  display: flex;
  justify-content: space-between;
}

.renner-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
}

.tooltip-overlay {
  position: absolute;
  z-index: 5;
  background: var(--background);
  border: 1px solid var(--border);
  border-top: none;
  padding: 0;
  top: 100%;
  left: -1px;
  width: 100%;
}
</style>
