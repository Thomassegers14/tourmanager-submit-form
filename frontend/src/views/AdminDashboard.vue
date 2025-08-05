<template>
<button @click="logout">Log uit</button>
  <section>    
    <h2>Admin Dashboard</h2>

    <!-- Filters -->
    <div class="filters">
      <input v-model="filters.voornaam" placeholder="Filter op voornaam" />
      <input v-model="filters.achternaam" placeholder="Filter op achternaam" />
      <input v-model="filters.email" placeholder="Filter op email" />
    </div>

    <table>
      <thead>
        <tr>
          <th>Voornaam</th>
          <th>Achternaam</th>
          <th>Email</th>
          <th>Aantal Renners</th>
          <th>Tijdstip</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="inzending in filteredInzendingen"
          :key="inzending.id"
          :class="{ duplicate: isDuplicate(inzending.email) }"
          title="Dubbele inzending"
        >
          <td>{{ inzending.voornaam }}</td>
          <td>{{ inzending.achternaam }}</td>
          <td>{{ inzending.email }}</td>
          <td>
            <button @click="toggleDetails(inzending.id)" class="button button-s">
              {{ inzending.rider_names_parsed.length }} renners
              <span v-if="expandedId === inzending.id">-</span>
              <span v-else>+</span>
            </button>
            <ul v-if="expandedId === inzending.id" class="renner-list">
              <li v-for="(renner, index) in inzending.rider_names_parsed" :key="index">
                {{ renner }}
              </li>
            </ul>
          </td>
          <td>{{ new Date(inzending.tijdstip).toLocaleString() }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router'
const router = useRouter()

const logout = () => {
  localStorage.removeItem('isAdmin')
  router.push('/')
}

const inzendingen = ref([]);
const expandedId = ref(null);
const filters = ref({
  voornaam: '',
  achternaam: '',
  email: '',
});

// Helper om de Postgres array-string te parsen naar een JS-array
const parsePostgresArray = (str) => {
  if (!str) return [];
  let trimmed = str.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    trimmed = trimmed.slice(1, -1);
  }
  return trimmed.split('","').map(s => s.replace(/^"|"$/g, ''));
};

const toggleDetails = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
};

// Filter inzendingen op basis van filters
const filteredInzendingen = computed(() => {
  return inzendingen.value.filter((item) => {
    const vMatch = item.voornaam.toLowerCase().includes(filters.value.voornaam.toLowerCase());
    const aMatch = item.achternaam.toLowerCase().includes(filters.value.achternaam.toLowerCase());
    const eMatch = item.email.toLowerCase().includes(filters.value.email.toLowerCase());
    return vMatch && aMatch && eMatch;
  });
});

// Bepaal welke emails dubbel voorkomen
const duplicateEmails = computed(() => {
  const counts = {};
  inzendingen.value.forEach(({ email }) => {
    const key = email.toLowerCase();
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .filter(([_, count]) => count > 1)
    .map(([email]) => email);
});

const isDuplicate = (email) => {
  return duplicateEmails.value.includes(email.toLowerCase());
};

onMounted(async () => {
  try {
    const res = await fetch('https://tourmanager-submit-form.onrender.com/inzendingen');
    const data = await res.json();
    data.forEach(item => {
      item.rider_names_parsed = parsePostgresArray(item.rider_names);
    });
    inzendingen.value = data;
  } catch (err) {
    console.error('Fout bij ophalen inzendingen:', err);
  }
});
</script>

<style scoped>
.filters {
  margin-bottom: 1rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filters input {
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  flex-grow: 1;
  min-width: 150px;
}

.renner-list {
  margin: 0.5rem 0 0 1rem;
  padding-left: 1rem;
  list-style-type: disc;
}

.renner-list li {
    margin: 0;
}

.duplicate {
  color: var(--destructive);
  /* evt. extra styling om op te vallen */
}
</style>
